'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HomeButton from '@/components/HomeButton';
import { PRIMARY_GRADES } from '@/lib/constants';

export default function AdminSummariesPage() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user?.isAdmin) { router.push('/login'); return; }
      load();
    });
  }, [router]);

  function load() {
    fetch('/api/summaries').then((r) => r.json()).then((d) => {
      setSummaries(d.summaries || []);
      setLoading(false);
    });
  }

  async function deleteSummary(id: number) {
    if (!confirm('حذف هذا التلخيص؟')) return;
    await fetch(`/api/summaries/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-slate-100 to-amber-50">
      <Header />
      <HomeButton />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← لوحة التحكم
          </Link>
          <div className="text-gray-400">/</div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex-1">إدارة التلخيصات</h1>
          <Link href="/admin/summary/new" className="px-4 py-2 bg-gradient-to-l from-amber-500 to-orange-600 text-white rounded-2xl font-bold shadow-md hover:shadow-xl transition">
            ➕ تلخيص جديد
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">⏳ جاري التحميل...</div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-md">
            <div className="text-6xl mb-3">📚</div>
            <p className="text-gray-500 font-semibold">لا توجد تلخيصات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {summaries.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-amber-100">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 relative">
                  {(s.imageUrl || (s.type === 'image' ? s.url : null)) ? (
                    <img src={s.imageUrl || s.url} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {s.type === 'youtube' ? '🎥' : '📄'}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-800 truncate">{s.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {PRIMARY_GRADES.find((g) => g.id === s.grade)?.short || s.grade}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">عرض</a>
                    <button onClick={() => deleteSummary(s.id)} className="px-2 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
