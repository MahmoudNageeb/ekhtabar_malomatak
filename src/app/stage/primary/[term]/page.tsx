'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';
import { PRIMARY_GRADES, TERMS, getTerm } from '@/lib/constants';

/**
 * 🆕 صفحة صفوف الفصل الدراسي
 * /stage/primary/term-1  →  الصفوف الستة للترم الأول
 * /stage/primary/term-2  →  الصفوف الستة للترم الثاني
 * نفس الصور، نفس التأثيرات، نفس التصميم — لكن كل ترم منفصل تمامًا.
 */
export default function PrimaryTermPage() {
  const params = useParams() as { term: string };
  const router = useRouter();
  const termId = params.term;
  const valid = TERMS.some((t) => t.id === termId);
  const term = getTerm(termId);

  useEffect(() => {
    if (!valid) router.replace('/stage/primary');
  }, [valid, router]);

  if (!valid) return null;

  const isFirst = term.id === 'term-1';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />

      <main id="term-grades-main" className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full relative">
        {/* خلفية زخرفية */}
        <div className={`absolute -top-10 -right-10 w-72 h-72 rounded-full blur-3xl ${isFirst ? 'bg-royal-200/40' : 'bg-emerald-200/40'}`}></div>
        <div className={`absolute top-40 -left-10 w-64 h-64 rounded-full blur-3xl ${isFirst ? 'bg-blue-200/40' : 'bg-teal-200/40'}`}></div>

        {/* Breadcrumb */}
        <nav className="relative flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
            <span>🏠</span> الرئيسية
          </Link>
          <span>›</span>
          <Link href="/stage/primary" className="hover:text-emerald-700 font-bold">المرحلة الابتدائية</Link>
          <span>›</span>
          <span className={`font-bold ${term.text}`}>{term.name}</span>
        </nav>

        {/* Hero */}
        <section id="term-hero" className="relative text-center mb-8 animate-fade-in-up">
          <div className={`inline-flex items-center gap-3 bg-gradient-to-l ${term.gradient} text-white px-7 py-3 rounded-2xl shadow-xl border-4 border-white`}>
            <span className="text-3xl animate-bounce-slow">{term.emoji}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{term.name}</h1>
            <span className="text-3xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🎒</span>
          </div>
          <p className="mt-4 text-gray-700 font-bold max-w-2xl mx-auto">
            🌟 اختر صفك الدراسي لتصل إلى اختبارات وتلخيصات {term.name}
          </p>

          {/* مبدّل الفصول السريع */}
          <div id="term-switcher" className="mt-5 inline-flex flex-wrap justify-center gap-2 bg-white p-2 rounded-2xl shadow-md border-2 border-gray-100">
            {TERMS.map((t) => (
              <Link
                key={t.id}
                href={`/stage/primary/${t.id}`}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                  t.id === term.id
                    ? `bg-gradient-to-l ${t.gradient} text-white shadow-lg scale-105`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t.emoji} {t.short}
              </Link>
            ))}
          </div>
        </section>

        {/* الصفوف الستة */}
        <section id="grades-grid" className="relative grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {PRIMARY_GRADES.map((g, i) => (
            <Link
              key={g.id}
              id={`grade-card-${g.id}`}
              href={`/grade/${g.id}?term=${term.id}`}
              className="stage-card group relative bg-white shadow-xl hover-lift overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <article className="aspect-[3/4] relative overflow-hidden rounded-3xl">
                <img
                  src={g.image}
                  alt={g.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${isFirst ? 'from-royal-900/85 via-royal-700/30' : 'from-emerald-900/85 via-emerald-700/30'} to-transparent`}></div>

                {/* رقم الصف */}
                <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 text-white font-extrabold text-xl rounded-2xl flex items-center justify-center shadow-xl border-2 border-white">
                  {i + 1}
                </div>

                {/* شارة الفصل */}
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 text-[10px] font-extrabold rounded-full shadow-lg border border-gold-200">
                  <span className={term.text}>{term.emoji} {term.short}</span>
                </div>

                {/* الاسم */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2.5 shadow-xl border-2 border-white">
                    <span className={`text-sm sm:text-base font-extrabold block ${isFirst ? 'text-royal-800' : 'text-emerald-800'}`}>
                      {g.name}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>

        {/* رسالة تشجيعية */}
        <section className={`relative mt-12 glass-card rounded-3xl p-8 text-center border-2 ${term.border}`}>
          <div className="text-5xl mb-3">{term.emoji}</div>
          <h3 className="text-xl font-extrabold royal-text">{term.name}</h3>
          <p className="text-gray-600 mt-2">
            كل صف يفتح لك اختبارات وتلخيصات هذا الفصل الدراسي فقط
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
