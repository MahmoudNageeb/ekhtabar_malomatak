import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Summary } from '@/models/Summary';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const grade = searchParams.get('grade');
  const stage = searchParams.get('stage');

  const where: any = {};
  if (grade) where.grade = grade;
  if (stage) where.stage = stage;

  const summaries = await Summary.find(where).sort({ createdAt: -1 }).lean();
  const list = summaries.map((s: any) => ({
    id: String(s._id),
    title: s.title,
    stage: s.stage,
    grade: s.grade,
    type: s.type,
    url: s.url,
    imageUrl: s.imageUrl,
    description: s.description,
    createdAt: s.createdAt
  }));
  return NextResponse.json({ summaries: list });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  try {
    const { title, stage, grade, type, url, imageUrl, description } = await req.json();
    if (!title || !stage || !grade || !type || !url) {
      return NextResponse.json({ error: 'كل البيانات مطلوبة' }, { status: 400 });
    }
    const summary = await Summary.create({
      title, stage, grade, type, url,
      imageUrl: imageUrl || null,
      description: description || null
    });
    return NextResponse.json({ success: true, summary: { id: String(summary._id) } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
