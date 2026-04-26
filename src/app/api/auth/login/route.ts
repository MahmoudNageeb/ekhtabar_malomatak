import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json({ error: 'الاسم وكلمة السر مطلوبان' }, { status: 400 });
    }

    const user = await User.findOne({ name: name.trim() });
    if (!user) {
      return NextResponse.json({ error: 'الاسم أو كلمة السر غير صحيحة' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: 'الاسم أو كلمة السر غير صحيحة' }, { status: 401 });
    }

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
