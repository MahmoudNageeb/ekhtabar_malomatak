'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';
import { PRIMARY_GRADES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function SearchResults() {
  const params = useSearchParams();
  const q = (params.get('q') || '').trim();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`/api/quizzes?search=${encodeURIComponent(q)}`).then((r) => r.json()),
      fetch(`/api/summaries`).then((r) => r.json())
    ]).then(([qd, sd]) => {
      setQuizzes(qd.quizzes || []);
      const sumList = (sd.summaries || []).filter(
        (s: any) => s.title?.toLowerCase().includes(q.toLowerCase()) ||
          s.description?.toLowerCase().includes(q.toLowerCase())
      );
      setSummaries(sumList);
      const matchedGrades = PRIMARY_GRADES.filter(
        (g) => g.name.includes(q) || g.short.includes(q) || g.id.includes(q)
      );
      setGrades(matchedGrades);
    }).finally(() => setLoading(false));
  }, [q]);

  const totalResults = quizzes.length + grades.length + summaries.length;

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
      {/* عنوان الصفحة */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-royal-700 font-bold">الرئيسية</Link>
          <span>›</span>
          <span>نتائج البحث</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold royal-text">
          نتائج البحث عن: <span className="gold-text">"{q}"</span>
        </h1>
        {!loading && (
          <p className="mt-2 text-gray-600">
            تم العثور على <span className="font-bold text-royal-700">{totalResults}</span> نتيجة
          </p>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center py-20">
          <div className="spinner"></div>
          <div className="mt-4 text-gray-500 font-bold">جاري البحث...</div>
        </div>
      )}

      {!loading && totalResults === 0 && q && (
        <div className="text-center py-20 glass-card rounded-3xl p-12">
          <div className="text-7xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-700">لا توجد نتائج</h2>
          <p className="text-gray-500 mt-2">جرّب البحث بكلمات أخرى أو تصفح الصفحة الرئيسية</p>
          <Link
            href="/"
            className="inline-block mt-6 btn-royal btn-shine"
          >
            🏠 العودة للرئيسية
          </Link>
        </div>
      )}

      {!loading && !q && (
        <div className="text-center py-20 glass-card rounded-3xl p-12">
          <div className="text-6xl mb-4">🔎</div>
          <h2 className="text-2xl font-bold text-gray-700">اكتب كلمة للبحث</h2>
        </div>
      )}

      {/* الصفوف الدراسية */}
      {grades.length > 0 && (
        <section className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-royal-700 to-royal-500 text-white flex items-center justify-center text-xl shadow-lg">
              📚
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-royal-700">الصفوف الدراسية</h2>
              <div className="text-sm text-gray-500">{grades.length} نتيجة</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {grades.map((g) => (
              <Link
                key={g.id}
                href={`/grade/${g.id}`}
                className="card-premium p-4 hover-lift group"
              >
                <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative">
                  <img src={g.image} alt={g.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="font-bold text-royal-700 text-center group-hover:text-gold-600 transition-colors">{g.name}</h3>
                <div className="text-xs text-gray-500 text-center mt-1">المرحلة الابتدائية</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* الاختبارات */}
      {quizzes.length > 0 && (
        <section className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 text-white flex items-center justify-center text-xl shadow-lg">
              📝
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-royal-700">الاختبارات</h2>
              <div className="text-sm text-gray-500">{quizzes.length} نتيجة</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/quiz/${quiz.id}`}
                className="card-premium p-5 hover-lift group block"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-royal-700 to-royal-500 text-white flex items-center justify-center text-xl flex-shrink-0">
                    📝
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 group-hover:text-royal-700 transition-colors line-clamp-2">{quiz.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="px-2 py-1 bg-royal-50 text-royal-700 rounded-full font-bold">{quiz.grade}</span>
                      <span className="px-2 py-1 bg-gold-50 text-gold-700 rounded-full font-bold">{quiz.questionCount} سؤال</span>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold">{quiz.duration} د</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center text-sm font-bold text-gold-600 group-hover:gap-3 inline-flex items-center gap-2 transition-all">
                  ابدأ الاختبار <span>←</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* التلخيصات */}
      {summaries.length > 0 && (
        <section className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-lg">
              📖
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-royal-700">التلخيصات</h2>
              <div className="text-sm text-gray-500">{summaries.length} نتيجة</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries.map((s: any) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-premium p-4 hover-lift group block"
              >
                {s.imageUrl && (
                  <div className="aspect-video rounded-xl overflow-hidden mb-3">
                    <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                )}
                <h3 className="font-bold text-royal-700 group-hover:text-gold-600 transition-colors">{s.title}</h3>
                <div className="text-xs text-gray-500 mt-1">{s.grade}</div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="spinner"></div></div>}>
        <SearchResults />
      </Suspense>
      <Footer />
    </div>
  );
}
