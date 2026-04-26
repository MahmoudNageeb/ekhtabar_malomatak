'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HomeButton from '@/components/HomeButton';
import { PRIMARY_GRADES } from '@/lib/constants';

export default function NewSummaryPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState('primary');
  const [grade, setGrade] = useState('grade-1');
  const [type, setType] = useState<'image' | 'youtube' | 'file'>('image');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user?.isAdmin) router.push('/login');
      else setAuthorized(true);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title || !url) return setError('العنوان والرابط مطلوبان');
    setSaving(true);
    const res = await fetch('/api/summaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, stage, grade, type, url, imageUrl, description })
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      return setError(d.error || 'خطأ');
    }
    router.push('/admin/summaries');
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-slate-100 to-amber-50">
      <Header />
      <HomeButton />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← لوحة التحكم
          </Link>
          <div className="text-gray-400">/</div>
          <h1 className="text-2xl font-extrabold text-gray-800">إضافة تلخيص جديد</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 space-y-4 border-2 border-amber-100">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">عنوان التلخيص</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500"
              placeholder="مثال: تلخيص رياضيات الفصل الأول" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">المرحلة</label>
              <select value={stage} onChange={(e) => { setStage(e.target.value); setGrade(e.target.value === 'primary' ? 'grade-1' : 'prep-1'); }}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-2xl bg-white">
                <option value="primary">المرحلة الابتدائية</option>
                <option value="preparatory">المرحلة الإعدادية</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">الصف</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-2xl bg-white">
                {(stage === 'primary' ? PRIMARY_GRADES : [
                  { id: 'prep-1', name: 'الصف الأول الإعدادي' },
                  { id: 'prep-2', name: 'الصف الثاني الإعدادي' },
                  { id: 'prep-3', name: 'الصف الثالث الإعدادي' }
                ]).map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">نوع التلخيص</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 'image', l: '🖼️ صورة', d: 'صورة من الإنترنت' },
                { v: 'youtube', l: '🎥 يوتيوب', d: 'رابط فيديو يوتيوب' },
                { v: 'file', l: '📄 ملف', d: 'رابط ملف PDF' }
              ].map((t) => (
                <button key={t.v} type="button" onClick={() => setType(t.v as any)}
                  className={`p-3 rounded-2xl border-2 font-bold transition-all ${type === t.v ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                  <div>{t.l}</div>
                  <div className="text-xs opacity-70 mt-0.5">{t.d}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">الرابط</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500"
              placeholder={type === 'youtube' ? 'https://youtube.com/...' : type === 'image' ? 'https://res.cloudinary.com/...' : 'https://drive.google.com/...'} required />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">رابط صورة الغلاف (اختياري)</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500"
              placeholder="رابط صورة لتظهر كغلاف للتلخيص (يفضل لليوتيوب والملفات)" />
            <p className="text-xs text-gray-500 mt-1">💡 إذا كان النوع "صورة" ولم تضف غلافًا، سيتم استخدام الرابط نفسه كغلاف</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">وصف (اختياري)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-3 border-2 border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 resize-none" />
          </div>

          {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl font-semibold">⚠️ {error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-gradient-to-l from-amber-500 to-orange-600 text-white rounded-2xl font-extrabold shadow-lg btn-shine disabled:opacity-50">
              {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التلخيص'}
            </button>
            <Link href="/admin" className="flex-1 text-center py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">إلغاء</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
