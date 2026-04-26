import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Summary } from '@/models/Summary';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  if (!mongoose.Types.ObjectId.isValid(params.id)) return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
  await Summary.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  if (!mongoose.Types.ObjectId.isValid(params.id)) return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });
  const data = await req.json();
  const updated = await Summary.findByIdAndUpdate(params.id, data, { new: true }).lean();
  return NextResponse.json({ success: true, summary: updated });
}
