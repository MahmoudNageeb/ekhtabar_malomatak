import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';
import { normalizeTerm } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  try {
    const data = await req.json();
    const quizzes = Array.isArray(data) ? data : [data];

    const created: any[] = [];
    for (const q of quizzes) {
      if (!q.title || !q.stage || !q.grade || !q.duration || !Array.isArray(q.questions)) {
        return NextResponse.json({ error: `بيانات ناقصة في الاختبار: ${q.title || 'بدون اسم'}` }, { status: 400 });
      }
      const quiz = await Quiz.create({
        title: q.title,
        stage: q.stage,
        grade: q.grade,
        // 🆕 دعم "term": "term-1" أو "term-2" — لو غير محدد يعتبر الترم الثاني
        term: normalizeTerm(q.term),
        duration: Number(q.duration),
        passingScore: q.passingScore !== undefined ? Number(q.passingScore) : 50,
        coverImage: q.coverImage || null,
        questions: q.questions.map((qq: any, i: number) => ({
          type: qq.type || 'mcq',
          questionText: qq.questionText,
          optionA: qq.optionA || null,
          optionB: qq.optionB || null,
          optionC: qq.optionC || null,
          optionD: qq.optionD || null,
          correctAnswer: String(qq.correctAnswer),
          points: qq.points !== undefined ? Number(qq.points) : 1,
          imageUrl: qq.imageUrl || null,
          order: i
        }))
      });
      created.push({ id: String(quiz._id), title: quiz.title, term: quiz.term });
    }
    return NextResponse.json({ success: true, count: created.length, quizzes: created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'خطأ في الاستيراد' }, { status: 500 });
  }
}
