import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    // التحقق من الصلاحيات (الأدمن فقط يرفع)
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'غير مصرح - لازم تكون أدمن' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'ekhtabar_malomatak';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'نوع الملف غير مدعوم. الأنواع المسموحة: JPG, PNG, WEBP, GIF'
      }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: `حجم الملف كبير جداً (${Math.round(file.size / 1024 / 1024)}MB). الحد الأقصى 10MB`
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImage(buffer, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height
    });
  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({
      error: e?.message || 'فشل رفع الصورة'
    }, { status: 500 });
  }
}
