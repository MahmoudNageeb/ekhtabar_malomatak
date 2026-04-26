'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';
import { PRIMARY_GRADES } from '@/lib/constants';

export default function GradePage() {
  const params = useParams() as { id: string };
  const id = params.id;
  const [tab, setTab] = useState<'quizzes' | 'summaries'>('quizzes');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const grade = PRIMARY_GRADES.find((g) => g.id === id);

  useEffect(() => {
    Promise.all([
      fetch(`/api/quizzes?grade=${id}`).then((r) => r.json()),
      fetch(`/api/summaries?grade=${id}`).then((r) => r.json())
    ]).then(([q, s]) => {
      setQuizzes(q.quizzes || []);
      setSummaries(s.summaries || []);
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
            <span>🏠</span> الرئيسية
          </Link>
          <span>›</span>
          <Link href="/stage/primary" className="hover:text-emerald-700 font-bold">المرحلة الابتدائية</Link>
          <span>›</span>
          <span className="text-emerald-700 font-bold truncate">{grade?.name || id}</span>
        </div>

        {/* العنوان الكبير */}
        <div className="relative bg-gradient-to-l from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 text-white overflow-hidden animate-fade-in-up">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-gold-400/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/15 rounded-full blur-2xl"></div>
          <div className="absolute top-0 right-0 w-full h-full opacity-10 dot-pattern"></div>

          <div className="relative flex flex-col sm:flex-row items-center gap-5">
            {grade && (
              <div className="relative">
                <img
                  src={grade.image}
                  alt=""
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-2xl"
                />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gold-500 rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 border-white animate-bounce-slow">
                  🎓
                </div>
              </div>
            )}
            <div className="text-center sm:text-right flex-1">
              <div className="text-xs opacity-80 mb-1 font-bold">المرحلة الابتدائية</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow-lg">{grade?.name || 'الصف'}</h1>
              <p className="opacity-90 mt-2 text-sm sm:text-base font-semibold">
                ✨ اكتشف الاختبارات والتلخيصات المخصصة لصفك
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold border border-white/40">
                  📝 {quizzes.length} اختبار
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold border border-white/40">
                  📚 {summaries.length} تلخيص
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* التبويبات */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-md border-2 border-royal-100">
          <button
            onClick={() => setTab('quizzes')}
            className={`flex-1 py-3.5 rounded-xl font-extrabold transition-all ${
              tab === 'quizzes'
                ? 'bg-gradient-to-l from-royal-700 to-royal-600 text-white shadow-lg shadow-royal-700/30'
                : 'text-gray-600 hover:bg-royal-50'
            }`}
          >
            📝 الاختبارات ({quizzes.length})
          </button>
          <button
            onClick={() => setTab('summaries')}
            className={`flex-1 py-3.5 rounded-xl font-extrabold transition-all ${
              tab === 'summaries'
                ? 'bg-gradient-to-l from-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/30'
                : 'text-gray-600 hover:bg-gold-50'
            }`}
          >
            📚 التلخيصات ({summaries.length})
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="spinner"></div>
            <div className="mt-4 text-gray-500 font-bold">جاري التحميل...</div>
          </div>
        ) : tab === 'quizzes' ? (
          <QuizList quizzes={quizzes} />
        ) : (
          <SummaryList summaries={summaries} />
        )}
      </main>

      <Footer />
    </div>
  );
}

function QuizList({ quizzes }: { quizzes: any[] }) {
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-3xl border-2 border-dashed border-royal-200">
        <div className="text-7xl mb-4 animate-bounce-slow">📝</div>
        <p className="text-gray-700 font-extrabold text-lg">لا توجد اختبارات بعد</p>
        <p className="text-gray-500 mt-2">سيتم إضافة اختبارات شيقة قريبًا — تابعنا!</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {quizzes.map((q, i) => (
        <Link
          key={q.id}
          href={`/quiz/${q.id}`}
          className="group card-premium p-5 hover-lift animate-fade-in-up"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="bg-gradient-to-br from-royal-700 to-royal-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:rotate-12 transition-transform">
              📝
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 font-extrabold px-3 py-1.5 rounded-full border border-emerald-200">
              ✓ نشط
            </span>
          </div>
          <h3 className="font-extrabold text-lg text-gray-800 group-hover:text-royal-700 transition-colors line-clamp-2 min-h-[3rem]">
            {q.title}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-royal-50 text-royal-700 text-xs rounded-full font-bold border border-royal-200">
              ⏱️ {q.duration} دقيقة
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold-50 text-gold-700 text-xs rounded-full font-bold border border-gold-200">
              ❓ {q.questionCount || 0} سؤال
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-semibold">اختبر معلوماتك</span>
            <span className="inline-flex items-center gap-1 text-royal-700 font-extrabold text-sm group-hover:gap-3 transition-all group-hover:text-gold-600">
              ابدأ <span>←</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SummaryList({ summaries }: { summaries: any[] }) {
  if (summaries.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-3xl border-2 border-dashed border-gold-200">
        <div className="text-7xl mb-4 animate-bounce-slow">📚</div>
        <p className="text-gray-700 font-extrabold text-lg">لا توجد تلخيصات بعد</p>
        <p className="text-gray-500 mt-2">سيتم إضافة تلخيصات شاملة قريبًا</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {summaries.map((s, i) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group card-premium overflow-hidden hover-lift animate-fade-in-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="aspect-square overflow-hidden bg-gradient-to-br from-gold-100 to-amber-100 relative">
            {s.imageUrl ? (
              <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : s.type === 'image' ? (
              <img src={s.url} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                {s.type === 'youtube' ? '🎥' : '📄'}
              </div>
            )}
            <div className="absolute top-2 right-2 bg-white/95 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-md border border-gold-200">
              {s.type === 'youtube' ? '🎥 فيديو' : s.type === 'file' ? '📄 ملف' : '🖼️ صورة'}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-royal-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
              <span className="px-3 py-1 bg-gold-500 text-white text-xs font-bold rounded-full">افتح ←</span>
            </div>
          </div>
          <div className="p-3 text-center">
            <h3 className="font-extrabold text-gray-800 text-sm truncate group-hover:text-royal-700 transition-colors">{s.title}</h3>
          </div>
        </a>
      ))}
    </div>
  );
}
