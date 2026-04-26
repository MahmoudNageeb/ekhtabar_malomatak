import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, password, stage, grade } = await req.json();

    if (!name || !password || !stage || !grade) {
      return NextResponse.json({ error: 'كل الحقول مطلوبة' }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: 'كلمة السر يجب أن تكون 4 حروف على الأقل' }, { status: 400 });
    }

    const existing = await User.findOne({ name: name.trim() }).lean();
    if (existing) {
      return NextResponse.json({ error: 'هذا الاسم مسجل بالفعل، اختر اسمًا آخر' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      password: hashed,
      stage,
      grade,
      isAdmin: false
    });

    const token = signToken({
      id: String(user._id),
      name: user.name,
      isAdmin: user.isAdmin,
      stage: user.stage,
      grade: user.grade
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: String(user._id),
        name: user.name,
        isAdmin: user.isAdmin,
        stage: user.stage,
        grade: user.grade
      }
    });
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });
    return res;
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message || 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
