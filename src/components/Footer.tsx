'use client';
import { TELEGRAM_URL, LOGO_URL } from '@/lib/constants';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 relative overflow-hidden">
      {/* خلفية متدرجة مع نمط */}
      <div className="absolute inset-0 bg-gradient-to-bl from-royal-900 via-royal-800 to-royal-700"></div>
      <div className="absolute inset-0 opacity-10 dot-pattern"></div>

      {/* أشكال زخرفية */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-royal-400/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* القسم الأول - اللوجو والوصف */}
          <div className="text-center md:text-right">
            <div className="h-20 w-20 mx-auto md:mx-0 mb-3 rounded-full overflow-hidden bg-white/10 ring-4 ring-amber-400/70 shadow-[0_8px_30px_rgba(245,178,31,0.4)]">
              <img src={LOGO_URL} alt="اختبر معلوماتك" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-extrabold gold-text mb-2">اختبر معلوماتك</h3>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              منصة تعليمية احترافية تقدم اختبارات وتلخيصات لجميع المراحل الدراسية بأسلوب شيق ومميز
            </p>
          </div>

          {/* القسم الثاني - تحت إشراف */}
          <div className="text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-5 border border-white/20 hover:border-gold-400 transition-colors">
              <div className="text-xs text-blue-100/80 mb-1">✦ تحت إشراف ✦</div>
              <div className="text-2xl font-extrabold gold-text">أ / أسماء محمد نجيب</div>
              <div className="text-xs text-blue-100/70 mt-2">معلمة متميزة 🎓</div>
            </div>
          </div>

          {/* القسم الثالث - الروابط والتليجرام */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-gold-400 mb-3">تابعنا</h4>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-l from-sky-500 to-blue-600 hover:from-gold-500 hover:to-gold-600 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all btn-shine"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span className="font-bold">قناة التليجرام</span>
            </a>
            <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start text-sm">
              <Link href="/leaderboard" className="text-blue-100 hover:text-gold-400 transition-colors">🏆 الأوائل</Link>
              <span className="text-white/30">•</span>
              <Link href="/stage/primary" className="text-blue-100 hover:text-gold-400 transition-colors">📚 ابتدائي</Link>
              <span className="text-white/30">•</span>
              <Link href="/summaries" className="text-blue-100 hover:text-gold-400 transition-colors">📖 تلخيصات</Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/20 text-center text-sm">
          <div className="text-blue-100/70">
            © {new Date().getFullYear()} <span className="font-bold gold-text">اختبر معلوماتك</span> - جميع الحقوق محفوظة
          </div>
          <div className="text-xs text-blue-100/50 mt-1">صُنع بـ ❤️ لطلاب مصر</div>
        </div>
      </div>
    </footer>
  );
}
