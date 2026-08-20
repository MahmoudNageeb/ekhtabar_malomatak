import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';
import { QuizResult } from '@/models/QuizResult';
import { normalizeTerm } from '@/lib/constants';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// جلب اختبار محدد
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!isValidId(params.id)) {
    return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
  }
  const user = await getCurrentUser();

  const quiz = await Quiz.findById(params.id).lean() as any;
  if (!quiz) return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });

  const sortedQuestions = (quiz.questions || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  // إخفاء الإجابة الصحيحة عن المستخدم العادي
  const safeQuestions = sortedQuestions.map((q: any) => {
    const base: any = {
      id: String(q._id),
      questionText: q.questionText,
      type: q.type,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      order: q.order,
      points: q.points ?? 1,
      imageUrl: q.imageUrl || null
    };
    if (user?.isAdmin) base.correctAnswer = q.correctAnswer;
    return base;
  });

  const totalPoints = sortedQuestions.reduce((sum: number, q: any) => sum + (q.points ?? 1), 0);

  // 🆕 حالة محاولات المستخدم الحالي في هذا الاختبار
  let myAttempts = 0;
  let myBestPercentage: number | null = null;
  let myBestResultId: string | null = null;
  let isPerfect = false;

  if (user) {
    const mine = await QuizResult.find({ userId: user.id, quizId: quiz._id })
      .select('percentage createdAt')
      .sort({ percentage: -1, createdAt: -1 })
      .lean();
    myAttempts = mine.length;
    if (mine.length) {
      myBestPercentage = (mine[0] as any).percentage ?? 0;
      myBestResultId = String((mine[0] as any)._id);
      isPerfect = (myBestPercentage ?? 0) >= 100;
    }
  }

  return NextResponse.json({
    quiz: {
      id: String(quiz._id),
      title: quiz.title,
      stage: quiz.stage,
      grade: quiz.grade,
      term: quiz.term || 'term-2', // 🆕
      duration: quiz.duration,
      isActive: quiz.isActive,
      passingScore: quiz.passingScore ?? 50,
      coverImage: quiz.coverImage || null,
      totalPoints,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
      questions: safeQuestions,
      // 🆕 حالة محاولات المستخدم
      myAttempts,
      myBestPercentage,
      myBestResultId,
      isPerfect
    }
  });
}

// 🆕 تحديث (يحدّث نفس الاختبار بنفس الـ ID، لا ينشئ جديد)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  if (!isValidId(params.id)) return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });

  try {
    // التأكد من وجود الاختبار قبل التحديث
    const existingQuiz = await Quiz.findById(params.id);
    if (!existingQuiz) {
      return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
    }

    const body = await req.json();
    const { title, stage, grade, term, duration, isActive, passingScore, coverImage, questions } = body;

    // تحديث الحقول الأساسية
    if (title !== undefined) existingQuiz.title = title;
    if (stage !== undefined) existingQuiz.stage = stage;
    if (grade !== undefined) existingQuiz.grade = grade;
    if (term !== undefined) existingQuiz.term = normalizeTerm(term); // 🆕
    if (duration !== undefined) existingQuiz.duration = Number(duration);
    if (isActive !== undefined) existingQuiz.isActive = !!isActive;
    if (passingScore !== undefined) existingQuiz.passingScore = Number(passingScore);
    if (coverImage !== undefined) existingQuiz.coverImage = coverImage || null;

    // 🆕 استبدال الأسئلة كاملة (تحديث وليس إنشاء)
    if (Array.isArray(questions)) {
      existingQuiz.questions = questions.map((q: any, i: number) => ({
        questionText: q.questionText,
        type: q.type || 'mcq',
        optionA: q.optionA || null,
        optionB: q.optionB || null,
        optionC: q.optionC || null,
        optionD: q.optionD || null,
        correctAnswer: String(q.correctAnswer),
        points: q.points !== undefined ? Number(q.points) : 1,
        imageUrl: q.imageUrl || null,
        order: i
      })) as any;
    }

    existingQuiz.updatedAt = new Date();

    // 🆕 حفظ على نفس الـ document (نفس الـ _id) - تحديث وليس إنشاء جديد
    const updated = await existingQuiz.save();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الاختبار بنجاح',
      quiz: {
        id: String(updated._id),
        title: updated.title,
        term: updated.term,
        updatedAt: updated.updatedAt
      }
    });
  } catch (e: any) {
    console.error('Update quiz error:', e);
    return NextResponse.json({ error: e?.message || 'فشل التحديث' }, { status: 500 });
  }
}

// حذف
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  if (!isValidId(params.id)) return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });

  await Quiz.findByIdAndDelete(params.id);
  await QuizResult.deleteMany({ quizId: params.id });
  return NextResponse.json({ success: true });
}
