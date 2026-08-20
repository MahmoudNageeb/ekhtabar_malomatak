'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/profile').then(async (r) => {
      if (r.status === 401) { router.push('/login'); return; }
      const d = await r.json();
      setData(d.user);
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="spinner"></div>
        <div className="mt-4 text-gray-500 font-bold">جاري التحميل...</div>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
            <span>🏠</span> الرئيسية
          </Link>
          <span>›</span>
          <span className="text-royal-700 font-bold">الصفحة الشخصية</span>
        </div>

        {/* بطاقة المستخدم */}
        <div className="relative bg-gradient-to-l from-royal-700 via-royal-600 to-royal-500 rounded-3xl p-7 shadow-2xl text-white overflow-hidden mb-6 animate-fade-in-up">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-gold-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-10 dot-pattern"></div>

          <div className="relative flex flex-col sm:flex-row items-center gap-5">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-gold-400 to-gold-600 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border-4 border-white">
                {data.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 border-white">
                ✓
              </div>
            </div>
            <div className="text-center sm:text-right flex-1">
              <h1 className="text-3xl font-extrabold drop-shadow-lg">{data.name}</h1>
              <div className="mt-2 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold border border-white/30">
                {data.stage === 'primary' ? '🎒 ابتدائي' : '📚 إعدادي'} • {data.grade}
              </div>
              <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-sm font-semibold opacity-90">إجمالي النقاط:</span>
                <span className="bg-gradient-to-l from-gold-400 to-gold-600 text-white font-extrabold px-4 py-1.5 rounded-2xl shadow-lg border-2 border-white/40">
                  ⭐ {data.totalPoints}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatBox icon="📝" label="عدد المحاولات" value={data.results.length} color="royal" />
          <StatBox icon="📚" label="اختبارات حليتها" value={data.summary?.quizzesTaken ?? 0} color="royal" />
          <StatBox icon="🏆" label="أعلى نسبة" value={`${data.results.length ? Math.max(...data.results.map((r: any) => r.percentage)) : 0}%`} color="gold" />
          <StatBox icon="⭐" label="نقاطي المحسوبة" value={data.summary?.countedPoints ?? data.totalPoints} color="gold" />
          <StatBox icon="🎯" label="درجات نهائية" value={data.summary?.perfectCount ?? 0} color="emerald" />
        </div>

        {/* 🆕 جدول درجات الطالب */}
        <div id="my-scores-table" className="glass-card rounded-3xl shadow-xl p-6 border-2 border-gold-200 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-extrabold gold-text flex items-center gap-2">
              <span>🎓</span>
              <span>درجاتي</span>
            </h2>
            <span className="text-[11px] bg-gold-100 text-gold-700 font-bold px-3 py-1 rounded-full border border-gold-300">
              تُحتسب أعلى درجة لكل اختبار في نقاطك
            </span>
          </div>

          {data.results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-semibold">
              لا توجد درجات بعد — ابدأ أول اختبار لك 🚀
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="bg-gradient-to-l from-royal-700 to-royal-600 text-white">
                    <th className="px-3 py-2.5 rounded-r-xl font-extrabold">الاختبار</th>
                    <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">الدرجة</th>
                    <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">النقاط</th>
                    <th className="px-3 py-2.5 font-extrabold whitespace-nowrap">النسبة</th>
                    <th className="px-3 py-2.5 rounded-l-xl font-extrabold whitespace-nowrap">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((r: any) => (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-100 hover:bg-royal-50/60 transition-colors ${r.isCounted ? 'bg-gold-50/50' : ''}`}
                    >
                      <td className="px-3 py-3">
                        <Link href={`/result/${r.id}`} className="font-bold text-royal-700 hover:text-gold-600 transition-colors">
                          {r.quiz?.title || 'اختبار'}
                        </Link>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString('ar-EG')}
                          {r.isCounted && <span className="mr-2 text-gold-600 font-bold">★ محسوبة في نقاطك</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-bold text-gray-700 whitespace-nowrap">
                        {r.score} / {r.totalQuestions}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-extrabold text-royal-700">⭐ {r.earnedPoints}</span>
                        <span className="text-gray-400"> / {r.totalPoints}</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`font-extrabold ${r.percentage >= 75 ? 'text-emerald-600' : r.percentage >= 50 ? 'text-royal-700' : 'text-orange-600'}`}>
                          {r.percentage}%
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {r.isPerfect ? (
                          <span className="text-[11px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-1 rounded-full border border-emerald-300">
                            🏆 نهائية
                          </span>
                        ) : r.passed ? (
                          <span className="text-[11px] bg-royal-100 text-royal-700 font-extrabold px-2 py-1 rounded-full border border-royal-300">
                            ✅ ناجح
                          </span>
                        ) : (
                          <span className="text-[11px] bg-orange-100 text-orange-700 font-extrabold px-2 py-1 rounded-full border border-orange-300">
                            ❌ راسب
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* سجل النتائج */}
        <div className="glass-card rounded-3xl shadow-xl p-6 border-2 border-royal-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold royal-text flex items-center gap-2">
              <span>📊</span>
              <span>سجل اختباراتي</span>
            </h2>
            <span className="text-xs bg-royal-100 text-royal-700 font-bold px-3 py-1 rounded-full">{data.results.length} اختبار</span>
          </div>
          {data.results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-7xl mb-3 animate-bounce-slow">📝</div>
              <p className="text-gray-700 font-extrabold text-lg">لم تحل أي اختبار بعد</p>
              <p className="text-gray-500 mt-2">ابدأ الآن وحقق نتائج رائعة!</p>
              <Link href="/stage/primary" className="inline-block mt-5 btn-royal btn-shine">
                🚀 ابدأ التحدي
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.results.map((r: any, i: number) => {
                const color =
                  r.percentage >= 75 ? 'border-emerald-300 from-emerald-50 to-teal-50' :
                  r.percentage >= 50 ? 'border-royal-300 from-royal-50 to-blue-50' :
                  'border-orange-300 from-orange-50 to-amber-50';
                const badge =
                  r.percentage >= 75 ? 'from-emerald-500 to-teal-600' :
                  r.percentage >= 50 ? 'from-royal-700 to-royal-600' :
                  'from-orange-500 to-orange-600';
                return (
                  <Link
                    key={r.id}
                    href={`/result/${r.id}`}
                    className={`block bg-gradient-to-l ${color} border-2 rounded-2xl p-4 hover:shadow-lg transition-all hover-lift animate-fade-in-up`}
                    style={{ animationDelay: `${Math.min(i, 6) * 0.06}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-white shadow-lg bg-gradient-to-br ${badge}`}>
                        <div className="text-center">
                          <div className="text-lg">{r.percentage}%</div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-gray-800 truncate">{r.quiz?.title || 'اختبار'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>📅 {new Date(r.createdAt).toLocaleDateString('ar-EG')}</span>
                          <span>•</span>
                          <span>✓ {r.score} من {r.totalQuestions}</span>
                          <span>•</span>
                          <span className="font-bold text-royal-700">⭐ {r.earnedPoints} من {r.totalPoints} نقطة</span>
                          {r.isPerfect && (
                            <span className="bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                              🏆 درجة نهائية
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-royal-600 text-2xl group-hover:translate-x-[-4px]">←</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatBox({ icon, label, value, color }: any) {
  const colors: any = {
    royal: 'from-royal-700 to-royal-500 shadow-royal-700/20',
    gold: 'from-gold-500 to-gold-600 shadow-gold-500/20',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20'
  };
  return (
    <div className="stat-card hover-lift text-center">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} text-white text-2xl shadow-lg mb-2`}>
        {icon}
      </div>
      <div className="text-xs text-gray-500 font-semibold">{label}</div>
      <div className="text-2xl font-extrabold royal-text mt-1">{value}</div>
    </div>
  );
}
