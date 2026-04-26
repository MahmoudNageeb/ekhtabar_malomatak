import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  await connectDB();
  const top = await User.find({ isAdmin: false, totalPoints: { $gt: 0 } })
    .sort({ totalPoints: -1 })
    .limit(10)
    .select('name totalPoints grade stage')
    .lean();

  const list = top.map((u: any) => ({
    id: String(u._id),
    name: u.name,
    totalPoints: u.totalPoints,
    grade: u.grade,
    stage: u.stage
  }));
  return NextResponse.json({ leaderboard: list });
}
