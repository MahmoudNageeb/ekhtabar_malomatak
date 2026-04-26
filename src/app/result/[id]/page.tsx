'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';
import { ARABIC_LETTERS, LOGO_URL } from '@/lib/constants';

export default function ResultDetailPage() {
  const params = useParams() as { id: string };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/results/${params.id}`).then(async (r) => {
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'خطأ'); setLoading(false); return; }
      setData(d.result);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="spinner"></div>
        <div className="text-gray-500 font-bold">جاري التحميل...</div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
        <p>{error || 'لم يتم العثور على النتيجة'}</p>
        <Link href="/" className="text-blue-600 font-bold">العودة للرئيسية</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
            <span>🏠</span> الرئيسية
          </Link>
          <span>›</span>
          <Link href="/profile" className="hover:text-royal-700 font-bold">الصفحة الشخصية</Link>
          <span>›</span>
          <span className="text-royal-700 font-bold">تفاصيل النتيجة</span>
        </div>

        {/* رأس النتيجة */}
        <div className="relative bg-gradient-to-l from-royal-700 via-royal-600 to-royal-500 rounded-3xl p-6 shadow-2xl text-white mb-6 overflow-hidden animate-fade-in-up">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-gold-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-10 dot-pattern"></div>
          <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-14 w-14 rounded-full overflow-hidden bg-white/20 ring-2 ring-amber-300 shadow-lg flex-shrink-0">
              <img src={LOGO_URL} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold drop-shadow-lg">{data.quiz.title}</h1>
              <p className="text-sm opacity-90 mt-1">👤 {data.user.name} • 📅 {new Date(data.createdAt).toLocaleString('ar-EG')}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/30">
              <div className="text-2xl sm:text-3xl font-extrabold">{data.percentage}%</div>
              <div className="text-xs opacity-90 mt-1 font-semibold">🎯 النسبة</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/30">
              <div className="text-2xl sm:text-3xl font-extrabold">{data.score}</div>
              <div className="text-xs opacity-90 mt-1 font-semibold">✅ صحيح</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/30">
              <div className="text-2xl sm:text-3xl font-extrabold">{data.totalQuestions}</div>
              <div className="text-xs opacity-90 mt-1 font-semibold">📝 إجمالي</div>
            </div>
          </div>
          </div>
        </div>

        {/* الأسئلة */}
        <div className="glass-card rounded-3xl shadow-xl p-5 sm:p-6 border-2 border-royal-100">
          <h2 className="text-xl font-extrabold royal-text mb-4 flex items-center gap-2">
            <span>📝</span>
            <span>تفاصيل الإجابات</span>
          </h2>
          <div className="space-y-4">
            {data.detailed.map((q: any, idx: number) => {
              const isMcq = q.type === 'mcq';
              const options = isMcq
                ? [
                    { key: 'A', label: q.options.A },
                    { key: 'B', label: q.options.B },
                    { key: 'C', label: q.options.C },
                    ...(q.options.D ? [{ key: 'D', label: q.options.D }] : [])
                  ]
                : [
                    { key: 'true', label: 'صح ✓' },
                    { key: 'false', label: 'خطأ ✗' }
                  ];
              return (
                <div key={q.questionId} className={`rounded-2xl p-4 border-2 ${q.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white shadow-md ${q.isCorrect ? 'bg-emerald-600' : 'bg-red-600'}`}>
                      {q.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">السؤال {idx + 1}</div>
                      <h4 className="font-extrabold text-gray-800">{q.questionText}</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:mr-12">
                    {options.map((opt: any, i: number) => {
                      const isCorrect = String(opt.key).toLowerCase() === String(q.correctAnswer).toLowerCase();
                      const isUserAnswer = String(opt.key).toLowerCase() === String(q.userAnswer).toLowerCase();
                      let style = 'bg-white border-gray-200 text-gray-600';
                      if (isCorrect) style = 'bg-emerald-100 border-emerald-400 text-emerald-800 font-bold';
                      else if (isUserAnswer) style = 'bg-red-100 border-red-400 text-red-800 font-bold';
                      return (
                        <div key={opt.key} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 ${style}`}>
                          {isMcq && (
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${isCorrect ? 'bg-emerald-600 text-white' : isUserAnswer ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                              {ARABIC_LETTERS[i]}
                            </span>
                          )}
                          <span className="flex-1 text-sm">{opt.label}</span>
                          {isCorrect && <span className="text-emerald-600 font-bold text-xs">✓ الصحيحة</span>}
                          {isUserAnswer && !isCorrect && <span className="text-red-600 font-bold text-xs">إجابته</span>}
                        </div>
                      );
                    })}
                  </div>
                  {!q.userAnswer && (
                    <div className="mt-2 sm:mr-12 text-sm text-orange-600 font-bold">⚠️ لم يجب على هذا السؤال</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
