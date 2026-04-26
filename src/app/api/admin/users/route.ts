import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  const where: any = { isAdmin: false };
  if (search) where.name = { $regex: search, $options: 'i' };

  const users = await User.find(where).sort({ totalPoints: -1 }).lean();
  const list = users.map((u: any) => ({
    id: String(u._id),
    name: u.name,
    grade: u.grade,
    stage: u.stage,
    totalPoints: u.totalPoints,
    createdAt: u.createdAt
  }));
  return NextResponse.json({ users: list });
}
