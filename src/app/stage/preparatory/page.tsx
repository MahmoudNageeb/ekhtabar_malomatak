'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';
import Link from 'next/link';
import { LOGO_URL } from '@/lib/constants';

export default function PreparatoryStagePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton variant="royal" />

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative overflow-hidden">

        {/* الخلفية */}
        <div className="absolute inset-0 bg-gradient-to-bl from-purple-50 via-white to-fuchsia-50"></div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl floating-shape"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-fuchsia-300/30 rounded-full blur-3xl floating-shape"></div>

        <div className="relative text-center max-w-lg animate-fade-in-up">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 justify-center">
            <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
              <span>🏠</span> الرئيسية
            </Link>
            <span>›</span>
            <span className="text-purple-700 font-bold">المرحلة الإعدادية</span>
          </div>

          {/* اللوجو */}
          <div className="relative inline-block mb-6">
            <div className="h-44 w-44 sm:h-56 sm:w-56 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-white via-purple-50 to-fuchsia-50 ring-4 ring-purple-400/80 ring-offset-4 ring-offset-white/40 shadow-[0_15px_50px_rgba(168,85,247,0.4)] animate-float">
              <img
                src={LOGO_URL}
                alt="اختبر معلوماتك"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full opacity-20 blur-3xl animate-pulse-slow -z-10"></div>
          </div>

          {/* الكارت */}
          <div className="glass-card rounded-3xl p-10 shadow-2xl border-2 border-purple-300 relative overflow-hidden">

            <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-fuchsia-200/50 rounded-full blur-2xl"></div>

            <div className="relative">

              <div className="text-7xl mb-4 animate-bounce-slow">🚀</div>

              <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-l from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent mb-3">
                قريبًا جدًا
              </h1>

              <div className="inline-block px-4 py-1.5 bg-gold-100 border-2 border-gold-300 rounded-full text-sm font-extrabold text-gold-700 mb-4">
                💎 المرحلة الإعدادية
              </div>

              <p className="text-gray-700 font-semibold leading-relaxed">
                نعمل بجد لإطلاق محتوى متميز للمرحلة الإعدادية يشمل اختبارات تفاعلية وتلخيصات شاملة
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">

                <Link
                  href="/stage/primary"
                  className="px-5 py-2.5 bg-gradient-to-l from-emerald-500 to-teal-600 text-white rounded-2xl font-bold shadow-lg hover:scale-105 transition-all"
                >
                  🎒 المرحلة الابتدائية
                </Link>

                <Link
                  href="/"
                  className="px-5 py-2.5 bg-white border-2 border-purple-300 text-purple-700 rounded-2xl font-bold hover:bg-purple-50 transition-all"
                >
                  ← الصفحة الرئيسية
                </Link>

              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
