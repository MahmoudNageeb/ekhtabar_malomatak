'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HomeButton from '@/components/HomeButton';
import { PRIMARY_GRADES } from '@/lib/constants';

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user?.isAdmin) { router.push('/login'); return; }
      load();
    });
  }, [router]);

  function load() {
    fetch('/api/quizzes?all=1').then((r) => r.json()).then((d) => {
      setQuizzes(d.quizzes || []);
      setLoading(false);
    });
  }

  async function toggleActive(q: any) {
    await fetch(`/api/quizzes/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !q.isActive })
    });
    load();
  }

  async function deleteQuiz(id: number) {
    if (!confirm('هل أنت متأكد من حذف هذا الاختبار؟ سيتم حذف كل النتائج المرتبطة به.')) return;
    await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-slate-100 to-blue-50">
      <Header />
      <HomeButton />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← لوحة التحكم
          </Link>
          <div className="text-gray-400">/</div>
          <h1 className="text-2xl font-extrabold text-gray-800 flex-1">إدارة الاختبارات</h1>
          <Link
            href="/admin/quiz/new"
            className="px-4 py-2 bg-gradient-to-l from-emerald-500 to-teal-600 text-white rounded-2xl font-bold shadow-md hover:shadow-xl transition"
          >
            ➕ اختبار جديد
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">⏳ جاري التحميل...</div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-md">
            <div className="text-6xl mb-3">📝</div>
            <p className="text-gray-500 font-semibold">لا توجد اختبارات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((q) => (
              <div key={q.id} className={`bg-white rounded-3xl shadow-md p-5 border-2 transition-all ${q.isActive ? 'border-emerald-200' : 'border-gray-200 opacity-70'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-extrabold text-lg text-gray-800">{q.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {PRIMARY_GRADES.find((g) => g.id === q.grade)?.short || q.grade} • ⏱️ {q.duration} د • ❓ {q._count?.questions || 0}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${q.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                    {q.isActive ? '✓ نشط' : '⏸ معطل'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/quiz/${q.id}/edit`} className="flex-1 min-w-[100px] text-center px-3 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition text-sm">
                    ✏️ تعديل
                  </Link>
                  <button onClick={() => toggleActive(q)} className="flex-1 min-w-[100px] px-3 py-2 bg-amber-100 text-amber-700 rounded-xl font-bold hover:bg-amber-200 transition text-sm">
                    {q.isActive ? '⏸ تعطيل' : '▶️ تفعيل'}
                  </button>
                  <button onClick={() => deleteQuiz(q.id)} className="flex-1 min-w-[100px] px-3 py-2 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition text-sm">
                    🗑 حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
