import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  await connectDB();

  // 🆕 عدد الأوائل المطلوب (افتراضي 10، أقصى 50)
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get('limit') || 10);
  const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 10, 1), 50);

  const top = await User.find({ isAdmin: false, totalPoints: { $gt: 0 } })
    .sort({ totalPoints: -1, name: 1 })
    .limit(limit)
    .select('name totalPoints grade stage')
    .lean();

  const list = top.map((u: any, i: number) => ({
    id: String(u._id),
    rank: i + 1, // 🆕 رقم الترتيب
    name: u.name,
    totalPoints: u.totalPoints,
    grade: u.grade,
    stage: u.stage
  }));

  return NextResponse.json({ leaderboard: list, count: list.length });
}
