import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { QuizResult } from '@/models/QuizResult';
import { User } from '@/models/User';
import { Quiz } from '@/models/Quiz';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  let userIds: any[] = [];
  if (search) {
    const matchedUsers = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id').lean();
    userIds = matchedUsers.map((u: any) => u._id);
  }

  const filter: any = search ? { userId: { $in: userIds } } : {};

  const results = await QuizResult.find(filter)
    .populate({ path: 'userId', model: User, select: 'name grade stage' })
    .populate({ path: 'quizId', model: Quiz, select: 'title grade stage' })
    .sort({ createdAt: -1 })
    .lean();

  const data = results.map((r: any) => ({
    id: String(r._id),
    score: r.score,
    totalQuestions: r.totalQuestions,
    percentage: r.percentage,
    createdAt: r.createdAt,
    user: r.userId ? {
      id: String(r.userId._id),
      name: r.userId.name,
      grade: r.userId.grade,
      stage: r.userId.stage
    } : null,
    quiz: r.quizId ? {
      id: String(r.quizId._id),
      title: r.quizId.title,
      grade: r.quizId.grade,
      stage: r.quizId.stage
    } : null
  }));

  return NextResponse.json({ results: data });
}
