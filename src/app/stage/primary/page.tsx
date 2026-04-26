'use client';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';
import { PRIMARY_GRADES } from '@/lib/constants';

export default function PrimaryStagePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full relative">
        {/* خلفية زخرفية */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-10 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl"></div>

        {/* Breadcrumb */}
        <div className="relative flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
            <span>🏠</span> الرئيسية
          </Link>
          <span>›</span>
          <span className="text-emerald-700 font-bold">المرحلة الابتدائية</span>
        </div>

        {/* Hero */}
        <div className="relative text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 bg-gradient-to-l from-emerald-500 to-teal-600 text-white px-7 py-3 rounded-2xl shadow-xl shadow-emerald-500/30 border-4 border-white">
            <span className="text-3xl animate-bounce-slow">🎒</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">المرحلة الابتدائية</h1>
            <span className="text-3xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>📚</span>
          </div>
          <p className="mt-4 text-gray-600 font-semibold max-w-2xl mx-auto">
            🌟 اختر صفك الدراسي وابدأ رحلتك التعليمية مع أفضل الاختبارات والتلخيصات
          </p>
          <div className="mt-2 inline-block px-4 py-1 bg-gold-50 border border-gold-300 rounded-full text-xs font-bold text-gold-700">
            6 صفوف دراسية متاحة
          </div>
        </div>

        {/* صفوف */}
        <div className="relative grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {PRIMARY_GRADES.map((g, i) => (
            <Link
              key={g.id}
              href={`/grade/${g.id}`}
              className="stage-card group relative bg-white shadow-xl hover-lift overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="aspect-[3/4] relative overflow-hidden rounded-3xl">
                <img
                  src={g.image}
                  alt={g.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-115 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/85 via-emerald-700/30 to-transparent"></div>

                {/* رقم الصف */}
                <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 text-white font-extrabold text-xl rounded-2xl flex items-center justify-center shadow-xl border-2 border-white">
                  {i + 1}
                </div>

                {/* شارة الانتقال */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/95 text-emerald-700 text-xs font-extrabold rounded-full shadow-lg opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                  افتح ←
                </div>

                {/* الاسم */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2.5 shadow-xl border-2 border-white">
                    <span className="text-sm sm:text-base font-extrabold text-emerald-800 block">{g.name}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* رسالة تشجيعية في الأسفل */}
        <div className="relative mt-12 glass-card rounded-3xl p-8 text-center border-2 border-emerald-200">
          <div className="text-5xl mb-3">🌟</div>
          <h3 className="text-xl font-extrabold royal-text">المعرفة قوة!</h3>
          <p className="text-gray-600 mt-2">كل صف يفتح لك أبواب جديدة من العلم والمعرفة</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
