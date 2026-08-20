'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';

export default function LeaderboardPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard?limit=10').then((r) => r.json()).then((d) => {
      setList(d.leaderboard || []);
      setLoading(false);
    });
  }, []);

  const medals = ['🥇', '🥈', '🥉'];
  const top3Gradients = [
    'from-yellow-300 via-gold-400 to-amber-600',
    'from-gray-200 via-gray-300 to-gray-500',
    'from-orange-300 via-orange-400 to-orange-600'
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton variant="white" />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
            <span>🏠</span> الرئيسية
          </Link>
          <span>›</span>
          <span className="text-gold-600 font-bold">قائمة الأوائل</span>
        </div>

        {/* Hero */}
        <div className="relative bg-gradient-to-l from-gold-500 via-amber-500 to-yellow-500 rounded-3xl p-8 shadow-2xl mb-8 text-white text-center overflow-hidden animate-fade-in-up">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-royal-500/30 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-10 dot-pattern"></div>

          <div className="relative">
            <div className="text-7xl mb-3 inline-block animate-float">🏆</div>
            <h1 className="text-3xl sm:text-5xl font-extrabold drop-shadow-lg">قائمة الأوائل</h1>
            <p className="opacity-95 mt-3 text-base sm:text-lg font-semibold max-w-xl mx-auto">
              👑 أعلى عشرة طلاب تحدوا أنفسهم وحققوا النجاح
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="spinner"></div>
            <div className="mt-4 text-gray-500 font-bold">جاري التحميل...</div>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border-2 border-dashed border-gold-200">
            <div className="text-7xl mb-4 animate-bounce-slow">🎯</div>
            <p className="text-xl font-extrabold text-royal-700">لا يوجد متصدرين بعد</p>
            <p className="text-gray-500 mt-2">كن أول المتصدرين واحجز مكانك على القمة!</p>
            <Link href="/stage/primary" className="inline-block mt-6 btn-royal btn-shine">
              🚀 ابدأ الآن
            </Link>
          </div>
        ) : (
          <>
            {/* القمة الثلاثية - شكل Podium */}
            {list.length >= 3 && (
              <div className="hidden md:grid grid-cols-3 gap-4 items-end mb-8">
                {[1, 0, 2].map((idx) => {
                  const u = list[idx];
                  if (!u) return null;
                  const heights = ['h-44', 'h-56', 'h-36'];
                  const order = idx === 0 ? 'order-2' : idx === 1 ? 'order-1' : 'order-3';
                  return (
                    <div key={u.id} className={`${order} animate-fade-in-up`} style={{ animationDelay: `${idx * 0.15}s` }}>
                      <div className={`relative bg-gradient-to-br ${top3Gradients[idx]} rounded-3xl shadow-2xl p-5 text-center border-4 border-white/70 ${heights[idx]} flex flex-col justify-end`}>
                        {idx === 0 && <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-5xl animate-float">👑</div>}
                        {/* 🆕 رقم الترتيب */}
                        <div className="absolute top-3 right-3 w-10 h-10 rounded-2xl bg-white text-royal-700 flex items-center justify-center text-lg font-extrabold shadow-lg border-2 border-gold-400">
                          {u.rank ?? idx + 1}
                        </div>
                        <div className="text-6xl mb-2 drop-shadow-lg">{medals[idx]}</div>
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-3 border border-white">
                          <div className="font-extrabold text-base royal-text truncate">{u.name}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {u.stage === 'primary' ? '🎒 ابتدائي' : '📚 إعدادي'}
                          </div>
                          <div className="mt-2 inline-block bg-gradient-to-l from-royal-700 to-royal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                            ⭐ {u.totalPoints} نقطة
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* القائمة الكاملة */}
            <div className="glass-card rounded-3xl shadow-xl overflow-hidden border-2 border-gold-200">
              <div className="px-5 py-4 bg-gradient-to-l from-royal-700 to-royal-600 text-white font-extrabold flex items-center gap-2">
                <span>📊</span>
                <span>الترتيب الكامل</span>
                <span className="ms-auto bg-gold-500 text-white text-xs px-3 py-1 rounded-full">{list.length} طالب</span>
              </div>
              {list.map((u, idx) => {
                const isTop3 = idx < 3;
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-4 sm:p-5 border-b border-gray-100 last:border-0 hover:bg-royal-50/50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(idx, 8) * 0.04}s` }}
                  >
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-md ${
                        isTop3
                          ? `bg-gradient-to-br ${top3Gradients[idx]} text-white border-2 border-white`
                          : 'bg-royal-50 text-royal-700 border-2 border-royal-200'
                      }`}
                    >
                      {isTop3 ? medals[idx] : `#${u.rank ?? idx + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-base sm:text-lg text-gray-800 truncate">{u.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>{u.stage === 'primary' ? '🎒 ابتدائي' : '📚 إعدادي'}</span>
                        {u.grade && (
                          <>
                            <span>•</span>
                            <span>{u.grade.replace('grade-', 'الصف ').replace('1', 'الأول').replace('2', 'الثاني').replace('3', 'الثالث').replace('4', 'الرابع').replace('5', 'الخامس').replace('6', 'السادس')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-gradient-to-l from-gold-500 to-gold-600 text-white text-sm sm:text-base font-extrabold px-3 sm:px-4 py-2 rounded-2xl shadow-md whitespace-nowrap">
                      ⭐ {u.totalPoints}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
