'use client';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';
import { TERMS, STAGE_IMAGES } from '@/lib/constants';

/**
 * 🆕 صفحة المرحلة الابتدائية = اختيار الفصل الدراسي
 * الضغط على المرحلة الابتدائية يعرض: الفصل الدراسي الأول / الفصل الدراسي الثاني
 */
export default function PrimaryStagePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />

      <main id="primary-stage-main" className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full relative">
        {/* خلفية زخرفية */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-10 w-64 h-64 bg-royal-200/30 rounded-full blur-3xl"></div>

        {/* Breadcrumb */}
        <nav className="relative flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
            <span>🏠</span> الرئيسية
          </Link>
          <span>›</span>
          <span className="text-emerald-700 font-bold">المرحلة الابتدائية</span>
        </nav>

        {/* Hero */}
        <section id="primary-hero" className="relative text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 bg-gradient-to-l from-emerald-500 to-teal-600 text-white px-7 py-3 rounded-2xl shadow-xl shadow-emerald-500/30 border-4 border-white">
            <span className="text-3xl animate-bounce-slow">🎒</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">المرحلة الابتدائية</h1>
            <span className="text-3xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>📚</span>
          </div>
          <p className="mt-5 text-gray-700 font-bold text-lg max-w-2xl mx-auto">
            🌟 اختر الفصل الدراسي أولًا لتصل إلى الاختبارات والتلخيصات الخاصة به
          </p>
          <div className="mt-3 inline-block px-4 py-1 bg-gold-50 border border-gold-300 rounded-full text-xs font-bold text-gold-700">
            فصلان دراسيان • 6 صفوف لكل فصل
          </div>
        </section>

        {/* 🆕 بطاقات الفصلين الدراسيين */}
        <section id="terms-grid" className="relative grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {TERMS.map((t, i) => (
            <Link
              key={t.id}
              id={`term-card-${t.id}`}
              href={`/stage/primary/${t.id}`}
              className="term-card group relative block animate-fade-in-up"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <article className="relative overflow-hidden rounded-3xl bg-white shadow-2xl hover-lift border-4 border-white">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    src={STAGE_IMAGES.primary}
                    alt={t.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${t.gradient} opacity-60 group-hover:opacity-70 transition-opacity`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute inset-0 opacity-10 dot-pattern"></div>

                  {/* أيقونة الفصل */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all border-2 border-gold-300">
                    <span className="text-3xl">{t.emoji}</span>
                  </div>

                  {/* شارة الانتقال */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-gold-500 text-white text-xs font-extrabold rounded-full shadow-lg opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all">
                    افتح الفصل ←
                  </div>

                  {/* العنوان */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-4 shadow-2xl border-2 border-white">
                      <h2 className="text-xl sm:text-2xl font-extrabold royal-text">{t.name}</h2>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold mt-1">{t.description}</p>
                      <div className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold px-3 py-1.5 rounded-full bg-gradient-to-l from-royal-700 to-royal-600 text-white shadow-md">
                        📚 6 صفوف دراسية
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>

        {/* رسالة تشجيعية */}
        <section className="relative mt-12 glass-card rounded-3xl p-8 text-center border-2 border-emerald-200">
          <div className="text-5xl mb-3">🌟</div>
          <h3 className="text-xl font-extrabold royal-text">المعرفة قوة!</h3>
          <p className="text-gray-600 mt-2">كل فصل دراسي يحتوي على اختبارات وتلخيصات خاصة به</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
