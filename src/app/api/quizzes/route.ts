import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';

export const dynamic = 'force-dynamic';

// جلب الاختبارات
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const grade = searchParams.get('grade');
  const stage = searchParams.get('stage');
  const search = searchParams.get('search');
  const adminAll = searchParams.get('all') === '1';

  const user = await getCurrentUser();

  const where: any = {};
  if (!adminAll || !user?.isAdmin) where.isActive = true;
  if (grade) where.grade = grade;
  if (stage) where.stage = stage;
  if (search) where.title = { $regex: search, $options: 'i' };

  const quizzes = await Quiz.find(where)
    .select('title stage grade duration isActive createdAt questions')
    .sort({ createdAt: -1 })
    .lean();

  const list = quizzes.map((q: any) => ({
    id: String(q._id),
    title: q.title,
    stage: q.stage,
    grade: q.grade,
    duration: q.duration,
    isActive: q.isActive,
    createdAt: q.createdAt,
    questionCount: q.questions?.length || 0
  }));

  return NextResponse.json({ quizzes: list });
}

// إضافة اختبار جديد (للأدمن فقط)
export async function POST(req: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  try {
    const { title, stage, grade, duration, questions } = await req.json();

    if (!title || !stage || !grade || !duration || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'كل البيانات مطلوبة وأضف على الأقل سؤالاً واحدًا' }, { status: 400 });
    }

    const quiz = await Quiz.create({
      title,
      stage,
      grade,
      duration: Number(duration),
      questions: questions.map((q: any, i: number) => ({
        questionText: q.questionText,
        type: q.type || 'mcq',
        optionA: q.optionA || null,
        optionB: q.optionB || null,
        optionC: q.optionC || null,
        optionD: q.optionD || null,
        correctAnswer: String(q.correctAnswer),
        order: i
      }))
    });

    return NextResponse.json({ success: true, quiz: { id: String(quiz._id) } });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || 'خطأ في إنشاء الاختبار' }, { status: 500 });
  }
}
