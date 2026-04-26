import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Favorite } from '@/models/Favorite';
import { Quiz } from '@/models/Quiz';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ favorites: [] });

  const favs = await Favorite.find({ userId: user.id })
    .populate({ path: 'quizId', model: Quiz, select: 'title duration grade stage' })
    .sort({ createdAt: -1 })
    .lean();

  const list = favs.filter((f: any) => f.quizId).map((f: any) => ({
    id: String(f._id),
    quiz: {
      id: String(f.quizId._id),
      title: f.quizId.title,
      duration: f.quizId.duration,
      grade: f.quizId.grade,
      stage: f.quizId.stage
    }
  }));
  return NextResponse.json({ favorites: list });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const { quizId } = await req.json();
  if (!mongoose.Types.ObjectId.isValid(quizId)) return NextResponse.json({ error: 'غير صالح' }, { status: 400 });
  try {
    const fav = await Favorite.create({ userId: user.id, quizId });
    return NextResponse.json({ success: true, favorite: { id: String(fav._id) } });
  } catch {
    return NextResponse.json({ error: 'موجود بالفعل' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get('quizId');
  if (!quizId) return NextResponse.json({ error: 'quizId مطلوب' }, { status: 400 });
  await Favorite.deleteOne({ userId: user.id, quizId });
  return NextResponse.json({ success: true });
}
