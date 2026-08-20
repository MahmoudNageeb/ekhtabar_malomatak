import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';
import { QuizResult } from '@/models/QuizResult';
import { User } from '@/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
  }

  const { answers } = await req.json();

  const quiz = await Quiz.findById(params.id).lean() as any;
  if (!quiz) return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });

  // 🆕 لو الطالب سبق وحصل على الدرجة النهائية (100%) في هذا الاختبار — لا يُسمح بإعادته
  const perfectAttempt = await QuizResult.findOne({
    userId: user.id,
    quizId: quiz._id,
    percentage: 100
  }).select('_id').lean();

  if (perfectAttempt) {
    return NextResponse.json(
      {
        error: 'لقد حصلت بالفعل على الدرجة النهائية في هذا الاختبار 🎉 لا يمكن إعادته مرة أخرى.',
        alreadyPerfect: true,
        resultId: String((perfectAttempt as any)._id)
      },
      { status: 403 }
    );
  }

  const sortedQuestions = (quiz.questions || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  // 🆕 حساب النقاط بناءً على نقاط كل سؤال (يتحكم بها الأدمن)
  let earnedPoints = 0;
  let totalPoints = 0;
  let correctCount = 0;

  const detailed = sortedQuestions.map((q: any) => {
    const qid = String(q._id);
    const userAnswer = answers?.[qid] ?? null;
    const correct = userAnswer != null && String(userAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase();
    const questionPoints = q.points ?? 1;

    totalPoints += questionPoints;
    if (correct) {
      earnedPoints += questionPoints;
      correctCount++;
    }

    return {
      questionId: qid,
      questionText: q.questionText,
      type: q.type,
      options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
      imageUrl: q.imageUrl || null,
      points: questionPoints,
      earnedPoints: correct ? questionPoints : 0,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect: correct
    };
  });

  const total = sortedQuestions.length;
  // 🆕 النسبة بناءً على النقاط (وليس عدد الأسئلة)
  const percentage = totalPoints ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passingScore = quiz.passingScore ?? 50;
  const passed = percentage >= passingScore;

  const result = await QuizResult.create({
    userId: user.id,
    quizId: quiz._id,
    score: correctCount,           // عدد الإجابات الصحيحة
    totalQuestions: total,
    earnedPoints,                  // 🆕 النقاط المحققة
    totalPoints,                   // 🆕 إجمالي النقاط
    percentage,
    passed,                        // 🆕 هل نجح؟
    passingScore,                  // 🆕 نسبة النجاح وقت الحل
    answers: detailed
  });

  // تحديث totalPoints بأخذ أعلى نقاط لكل اختبار
  const allResults = await QuizResult.find({ userId: user.id }).select('quizId earnedPoints percentage').lean();
  const bestPerQuiz = new Map<string, number>();
  for (const r of allResults) {
    const qid = String(r.quizId);
    const points = r.earnedPoints ?? r.percentage ?? 0; // backward compatible
    const prev = bestPerQuiz.get(qid) || 0;
    if (points > prev) bestPerQuiz.set(qid, points);
  }
  const userTotalPoints = Array.from(bestPerQuiz.values()).reduce((a, b) => a + b, 0);
  await User.findByIdAndUpdate(user.id, { totalPoints: userTotalPoints });

  return NextResponse.json({
    success: true,
    resultId: String(result._id),
    score: correctCount,
    total,
    earnedPoints,
    totalPoints,
    percentage,
    passingScore,
    passed,
    detailed
  });
}
