import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';
import { QuizResult } from '@/models/QuizResult';
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
      order: q.order
    };
    if (user?.isAdmin) base.correctAnswer = q.correctAnswer;
    return base;
  });

  return NextResponse.json({
    quiz: {
      id: String(quiz._id),
      title: quiz.title,
      stage: quiz.stage,
      grade: quiz.grade,
      duration: quiz.duration,
      isActive: quiz.isActive,
      createdAt: quiz.createdAt,
      questions: safeQuestions
    }
  });
}

// تحديث
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  if (!isValidId(params.id)) return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });

  try {
    const body = await req.json();
    const { title, stage, grade, duration, isActive, questions } = body;

    const update: any = {};
    if (title !== undefined) update.title = title;
    if (stage !== undefined) update.stage = stage;
    if (grade !== undefined) update.grade = grade;
    if (duration !== undefined) update.duration = Number(duration);
    if (isActive !== undefined) update.isActive = !!isActive;

    if (Array.isArray(questions)) {
      update.questions = questions.map((q: any, i: number) => ({
        questionText: q.questionText,
        type: q.type || 'mcq',
        optionA: q.optionA || null,
        optionB: q.optionB || null,
        optionC: q.optionC || null,
        optionD: q.optionD || null,
        correctAnswer: String(q.correctAnswer),
        order: i
      }));
    }

    const updated = await Quiz.findByIdAndUpdate(params.id, update, { new: true }).lean();
    return NextResponse.json({ success: true, quiz: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
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
