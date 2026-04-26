'use client';

import { TELEGRAM_URL, LOGO_URL } from '@/lib/constants';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 relative overflow-hidden">

      {/* الخلفية */}
      <div className="absolute inset-0 bg-gradient-to-bl from-royal-900 via-royal-800 to-royal-700"></div>
      <div className="absolute inset-0 opacity-10 dot-pattern"></div>

      {/* زخرفة */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-royal-400/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 text-white">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

          {/* اللوجو */}
          <div className="text-center md:text-right">
            <div className="h-20 w-20 mx-auto md:mx-0 mb-3 rounded-full overflow-hidden bg-white/10 ring-4 ring-amber-400/70">
              <img src={LOGO_URL} alt="logo" className="w-full h-full object-cover" />
            </div>

            <h3 className="text-xl font-extrabold gold-text mb-2">
              اختبر معلوماتك
            </h3>

            <p className="text-sm text-blue-100/80 leading-relaxed">
              منصة تعليمية احترافية تقدم اختبارات وتلخيصات لجميع المراحل الدراسية
            </p>
          </div>

          {/* المشرف */}
          <div className="text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-5 border border-white/20">

              <div className="text-xs text-blue-100/80 mb-1">
                ✦ تحت إشراف ✦
              </div>

              <div className="text-2xl font-extrabold gold-text">
                أ / أسماء محمد نجيب
              </div>

            </div>
          </div>

          {/* الروابط */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-gold-400 mb-3">تابعنا</h4>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-l from-sky-500 to-blue-600 rounded-2xl"
            >
              <span className="font-bold">قناة التليجرام</span>
            </a>

            <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start text-sm">
              <Link href="/leaderboard">🏆 الأوائل</Link>
              <span>•</span>
              <Link href="/stage/primary">📚 ابتدائي</Link>
              <span>•</span>
              <Link href="/summaries">📖 تلخيصات</Link>
            </div>

          </div>
        </div>

        {/* الحقوق */}
        <div className="mt-10 pt-6 border-t border-white/20 text-center text-sm">
          <div className="text-blue-100/70">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold gold-text">
              اختبر معلوماتك
            </span>
            {" "} - جميع الحقوق محفوظة
          </div>
        </div>

      </div>
    </footer>
  );
}
