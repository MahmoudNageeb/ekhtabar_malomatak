import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { QuizResult } from '@/models/QuizResult';
import { User } from '@/models/User';
import { Quiz } from '@/models/Quiz';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: 'غير موجود' }, { status: 404 });
  }

  const result = await QuizResult.findById(params.id)
    .populate({ path: 'userId', model: User, select: 'name grade stage' })
    .populate({ path: 'quizId', model: Quiz, select: 'title grade stage duration' })
    .lean() as any;

  if (!result) return NextResponse.json({ error: 'غير موجود' }, { status: 404 });

  if (!user.isAdmin && String(result.userId._id) !== user.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  return NextResponse.json({
    result: {
      id: String(result._id),
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      createdAt: result.createdAt,
      user: result.userId ? {
        id: String(result.userId._id),
        name: result.userId.name,
        grade: result.userId.grade,
        stage: result.userId.stage
      } : null,
      quiz: result.quizId ? {
        id: String(result.quizId._id),
        title: result.quizId.title,
        grade: result.quizId.grade,
        stage: result.quizId.stage,
        duration: result.quizId.duration
      } : null,
      detailed: result.answers || []
    }
  });
}
