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

  const sortedQuestions = (quiz.questions || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  let score = 0;
  const detailed = sortedQuestions.map((q: any) => {
    const qid = String(q._id);
    const userAnswer = answers?.[qid] ?? null;
    const correct = userAnswer != null && String(userAnswer).toLowerCase() === String(q.correctAnswer).toLowerCase();
    if (correct) score++;
    return {
      questionId: qid,
      questionText: q.questionText,
      type: q.type,
      options: { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD },
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect: correct
    };
  });

  const total = sortedQuestions.length;
  const percentage = total ? Math.round((score / total) * 100) : 0;

  const result = await QuizResult.create({
    userId: user.id,
    quizId: quiz._id,
    score,
    totalQuestions: total,
    percentage,
    answers: detailed
  });

  // تحديث totalPoints بأخذ أعلى نسبة لكل اختبار
  const allResults = await QuizResult.find({ userId: user.id }).select('quizId percentage').lean();
  const bestPerQuiz = new Map<string, number>();
  for (const r of allResults) {
    const qid = String(r.quizId);
    const prev = bestPerQuiz.get(qid) || 0;
    if (r.percentage > prev) bestPerQuiz.set(qid, r.percentage);
  }
  const totalPoints = Array.from(bestPerQuiz.values()).reduce((a, b) => a + b, 0);
  await User.findByIdAndUpdate(user.id, { totalPoints });

  return NextResponse.json({
    success: true,
    resultId: String(result._id),
    score,
    total,
    percentage,
    detailed
  });
}
