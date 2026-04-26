'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HomeButton from '@/components/HomeButton';

export default function AdminResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user?.isAdmin) { router.push('/login'); return; }
      load();
    });
  }, [router]);

  function load(q = '') {
    const url = q ? `/api/results?search=${encodeURIComponent(q)}` : '/api/results';
    fetch(url).then((r) => r.json()).then((d) => {
      setResults(d.results || []);
      setLoading(false);
    });
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    load(search);
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
          <h1 className="text-2xl font-extrabold text-gray-800">نتائج المستخدمين</h1>
        </div>

        {/* البحث */}
        <form onSubmit={onSearch} className="bg-white rounded-2xl shadow-md p-4 mb-5 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 ابحث باسم المستخدم..."
            className="flex-1 px-4 py-2.5 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="px-5 py-2.5 bg-gradient-to-l from-blue-600 to-indigo-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition">
            بحث
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); load(); }} className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition">
              ✕
            </button>
          )}
        </form>

        {loading ? (
          <div className="text-center py-12 text-gray-500">⏳ جاري التحميل...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-md">
            <div className="text-6xl mb-3">📊</div>
            <p className="text-gray-500 font-semibold">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-l from-slate-800 to-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-right font-bold text-sm">المستخدم</th>
                    <th className="px-4 py-3 text-right font-bold text-sm">الاختبار</th>
                    <th className="px-4 py-3 text-right font-bold text-sm">الصف</th>
                    <th className="px-4 py-3 text-right font-bold text-sm">الدرجة</th>
                    <th className="px-4 py-3 text-right font-bold text-sm">النسبة</th>
                    <th className="px-4 py-3 text-right font-bold text-sm">التاريخ</th>
                    <th className="px-4 py-3 text-center font-bold text-sm">تفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.id} className={`border-b border-gray-100 hover:bg-blue-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3 font-bold text-gray-800">{r.user.name}</td>
                      <td className="px-4 py-3 text-gray-700">{r.quiz.title}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{r.quiz.grade}</td>
                      <td className="px-4 py-3 font-bold">
                        {r.score} / {r.totalQuestions}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full font-bold text-sm ${r.percentage >= 75 ? 'bg-emerald-100 text-emerald-700' : r.percentage >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {r.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/result/${r.id}`} className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition text-xs">
                          تفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
