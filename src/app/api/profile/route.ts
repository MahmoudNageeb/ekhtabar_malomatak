import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { QuizResult } from '@/models/QuizResult';
import { Quiz } from '@/models/Quiz';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const data = await User.findById(user.id).lean() as any;
  const results = await QuizResult.find({ userId: user.id })
    .populate({ path: 'quizId', model: Quiz, select: 'title grade' })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    user: {
      id: String(data._id),
      name: data.name,
      stage: data.stage,
      grade: data.grade,
      totalPoints: data.totalPoints,
      results: results.map((r: any) => ({
        id: String(r._id),
        score: r.score,
        totalQuestions: r.totalQuestions,
        percentage: r.percentage,
        createdAt: r.createdAt,
        quiz: r.quizId ? {
          id: String(r.quizId._id),
          title: r.quizId.title,
          grade: r.quizId.grade
        } : null
      }))
    }
  });
}
