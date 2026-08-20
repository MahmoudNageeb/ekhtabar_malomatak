'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { STAGE_IMAGES, LOGO_URL } from '@/lib/constants';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [stats, setStats] = useState({ quizzes: 0, students: 0 });

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user));
    fetch('/api/leaderboard?limit=10').then((r) => r.json()).then((d) => setLeaders(d.leaderboard || []));
    // إحصائيات مبسطة (اختيارياً يمكن قراءتها من API لاحقًا)
    fetch('/api/quizzes').then((r) => r.json()).then((d) => {
      setStats((s) => ({ ...s, quizzes: (d.quizzes || []).length }));
    });
  }, []);

  const stages = [
    {
      id: 'primary',
      title: 'المرحلة الابتدائية',
      subtitle: '6 صفوف دراسية',
      image: STAGE_IMAGES.primary,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      accent: 'emerald',
      href: '/stage/primary',
      emoji: '🎒'
    },
    {
      id: 'preparatory',
      title: 'المرحلة الإعدادية',
      subtitle: 'قريبًا 🚀',
      image: STAGE_IMAGES.preparatory,
      gradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
      accent: 'purple',
      href: '/stage/preparatory',
      emoji: '📚'
    },
    {
      id: 'summaries',
      title: 'التلخيصات',
      subtitle: 'ملخصات ومراجعات',
      image: STAGE_IMAGES.summaries,
      gradient: 'from-gold-500 via-amber-500 to-orange-600',
      accent: 'gold',
      href: '/summaries',
      emoji: '📖'
    }
  ];

  const medals = ['🥇', '🥈', '🥉'];
  const medalGradients = [
    'from-yellow-300 via-gold-400 to-amber-500',
    'from-gray-200 via-gray-300 to-gray-500',
    'from-orange-300 via-orange-400 to-orange-600'
  ];

  const features = [
    { icon: '🎯', title: 'اختبارات تفاعلية', desc: 'أسئلة متنوعة مع تصحيح فوري' },
    { icon: '🏆', title: 'نظام النقاط', desc: 'اكسب النقاط واحصل على لقب' },
    { icon: '📖', title: 'تلخيصات شاملة', desc: 'ملخصات لجميع المواد' },
    { icon: '⏱️', title: 'مؤقت ذكي', desc: 'تدرب على إدارة الوقت' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ============ Hero Section ============ */}
      <section className="relative overflow-hidden">
        {/* الخلفية */}
        <div className="absolute inset-0 bg-gradient-to-bl from-royal-50 via-white to-gold-50/30"></div>
        <div className="absolute inset-0 pattern-bg"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-gold-300/30 rounded-full blur-3xl floating-shape"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-royal-300/30 rounded-full blur-3xl floating-shape"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-16">
          {/* أزرار التسجيل والدخول للضيوف */}
          {!user && (
            <div className="flex flex-wrap justify-center gap-3 mb-4 animate-fade-in-up">
              <Link
                href="/register"
                className="px-7 py-3 bg-gradient-to-l from-royal-700 to-royal-600 text-white rounded-2xl font-extrabold shadow-lg shadow-royal-700/30 hover:shadow-2xl hover:shadow-royal-700/50 hover:scale-105 transition-all btn-shine border-2 border-white"
              >
                ✨ إنشاء حساب جديد
              </Link>
              <Link
                href="/login"
                className="px-7 py-3 bg-gradient-to-l from-gold-500 to-gold-600 text-white rounded-2xl font-extrabold shadow-lg shadow-gold-500/30 hover:shadow-2xl hover:shadow-gold-500/50 hover:scale-105 transition-all btn-shine border-2 border-white"
              >
                🔐 تسجيل الدخول
              </Link>
            </div>
          )}

          {/* اللوجو الكبير + العنوان */}
          <div className="text-center mb-6">
            <div className="inline-block relative mb-2 logo-shine">
              <div className="h-32 w-32 sm:h-44 sm:w-44 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-white via-blue-50 to-amber-50 ring-4 ring-amber-400/80 ring-offset-4 ring-offset-white/40 shadow-[0_15px_50px_rgba(11,74,155,0.4)] animate-float">
                <img
                  src={LOGO_URL}
                  alt="اختبر معلوماتك"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -top-2 -right-2 text-3xl sparkle">✨</span>
              <span className="absolute -bottom-2 -left-2 text-2xl sparkle" style={{ animationDelay: '1s' }}>⭐</span>
            </div>

            <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold shimmer-text leading-tight">
              اختبر معلوماتك
            </h1>

            {/* جملة تحفيزية جذابة */}
            <div className="mt-6 max-w-3xl mx-auto">
              <p className="text-xl sm:text-2xl font-extrabold royal-text leading-relaxed gold-underline">
                🚀 رحلتك نحو التفوق تبدأ هنا
              </p>
              <p className="mt-4 text-base sm:text-lg text-gray-700 font-bold leading-relaxed">
                <span className="inline-block animate-bounce-slow text-2xl">💎</span>
                {' '}اكتشف موهبتك، تحدَّ نفسك، وكن من الأوائل!{' '}
                <span className="inline-block animate-bounce-slow text-2xl" style={{ animationDelay: '0.5s' }}>🌟</span>
              </p>
              <p className="mt-3 text-sm text-gray-500 font-semibold">
                منصة تعليمية احترافية • اختبارات تفاعلية • ملخصات حصرية • مراحل دراسية متعددة
              </p>
            </div>
          </div>

          {/* بطاقات المراحل */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {stages.map((s, idx) => (
              <Link
                key={s.id}
                href={s.href}
                className="stage-card group relative animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="aspect-[4/5] relative overflow-hidden rounded-3xl bg-white shadow-2xl">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* تدرج الأسفل */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${s.gradient} opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  {/* أيقونة في الأعلى */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all border-2 border-gold-300">
                    <span className="text-2xl">{s.emoji}</span>
                  </div>

                  {/* شارة "ابدأ الآن" */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-gold-500 text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all">
                    ابدأ الآن ←
                  </div>

                  {/* العنوان في الأسفل */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl border-2 border-white">
                      <div className="text-lg sm:text-xl font-extrabold royal-text">{s.title}</div>
                      <div className="text-xs text-gray-600 font-semibold mt-1">{s.subtitle}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Features Section ============ */}
      <section className="py-14 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-l from-royal-100 to-gold-100 px-6 py-2 rounded-full border-2 border-gold-300 mb-3">
              <span className="text-xl">⚡</span>
              <span className="text-sm font-extrabold royal-text">مميزات المنصة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold royal-text">لماذا اختبر معلوماتك؟</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="stat-card hover-lift text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl mb-2">{f.icon}</div>
                <h3 className="font-extrabold text-royal-700 text-sm sm:text-base">{f.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ قسم الأوائل ============ */}
      <section className="py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-gold-50 via-white to-royal-50"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-200/40 rounded-full blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-l from-gold-200 to-yellow-100 px-6 py-2 rounded-full border-2 border-gold-400 shadow-lg">
              <span className="text-2xl animate-bounce-slow">🏆</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold gold-text">قائمة الأوائل</h2>
              <span className="text-2xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>👑</span>
            </div>
          </div>

          {leaders.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-3xl">
              <div className="text-7xl mb-4 animate-bounce-slow">🎯</div>
              <div className="text-xl font-bold text-royal-700">لم يتم تسجيل نتائج بعد</div>
              <div className="text-gray-500 mt-2">كن أنت الأول واحجز مكانك على القمة!</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* المركز الثاني */}
              {leaders[1] && (
                <div className="md:order-1 order-2 transform md:translate-y-8 animate-fade-in-up">
                  <LeaderCard rank={2} name={leaders[1].name} points={leaders[1].totalPoints} medal={medals[1]} color={medalGradients[1]} />
                </div>
              )}
              {/* المركز الأول */}
              {leaders[0] && (
                <div className="md:order-2 order-1 md:scale-110 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <LeaderCard rank={1} name={leaders[0].name} points={leaders[0].totalPoints} medal={medals[0]} color={medalGradients[0]} crown />
                </div>
              )}
              {/* المركز الثالث */}
              {leaders[2] && (
                <div className="md:order-3 order-3 transform md:translate-y-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <LeaderCard rank={3} name={leaders[2].name} points={leaders[2].totalPoints} medal={medals[2]} color={medalGradients[2]} />
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gold-400 text-royal-700 rounded-2xl font-extrabold shadow-lg hover:bg-gradient-to-l hover:from-gold-500 hover:to-gold-600 hover:text-white hover:scale-105 transition-all"
            >
              🏆 عرض أفضل 10 طلاب <span>←</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA Section ============ */}
      {!user && (
        <section className="py-14 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-royal-700 via-royal-600 to-royal-500"></div>
          <div className="absolute inset-0 opacity-10 dot-pattern"></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold-500/40 rounded-full blur-3xl animate-pulse"></div>

          <div className="relative max-w-4xl mx-auto text-center text-white">
            <div className="text-5xl sm:text-7xl mb-4 animate-bounce-slow">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">جاهز لتبدأ رحلة التفوق؟</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              انضم لآلاف الطلاب الذين حققوا أحلامهم مع منصة اختبر معلوماتك. سجل الآن مجانًا وابدأ التحدي!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white rounded-2xl font-extrabold text-lg shadow-2xl hover:scale-105 transition-all btn-shine pulse-glow"
              >
                ✨ سجل الآن مجانًا
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white text-white rounded-2xl font-extrabold text-lg shadow-2xl hover:bg-white hover:text-royal-700 hover:scale-105 transition-all"
              >
                🔐 لدي حساب
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

function LeaderCard({ rank, name, points, medal, color, crown = false }: any) {
  return (
    <div className={`relative bg-gradient-to-br ${color} rounded-3xl shadow-2xl p-6 text-center hover-lift transition-all border-4 border-white/60`}>
      {crown && <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-5xl animate-float">👑</div>}
      {/* 🆕 رقم الترتيب واضح */}
      <div className="absolute top-3 right-3 w-11 h-11 rounded-2xl bg-white text-royal-700 flex items-center justify-center text-xl font-extrabold shadow-lg border-2 border-gold-400">
        {rank}
      </div>
      <div className="text-7xl mb-2 drop-shadow-lg">{medal}</div>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-3 mt-2 shadow-inner border border-white">
        <div className="text-base sm:text-lg font-extrabold royal-text truncate">{name}</div>
        <div className="text-xs text-gray-500 mt-1 font-semibold">المركز {rank === 1 ? 'الأول 🥇' : rank === 2 ? 'الثاني 🥈' : 'الثالث 🥉'}</div>
        <div className="mt-2 inline-block bg-gradient-to-l from-royal-700 to-royal-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
          ⭐ {points} نقطة
        </div>
      </div>
    </div>
  );
}
