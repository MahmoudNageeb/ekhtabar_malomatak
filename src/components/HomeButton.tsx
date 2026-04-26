'use client';
import Link from 'next/link';

/**
 * زرّ أيقونة "الصفحة الرئيسية" يظهر في كل الصفحات الفرعية (عائم في أعلى يسار الصفحة).
 * يحتوي على lottie-like glow ويتموضع فوق المحتوى.
 */
export default function HomeButton({
  position = 'fixed',
  variant = 'gold'
}: {
  position?: 'fixed' | 'inline';
  variant?: 'gold' | 'royal' | 'white';
}) {
  const variants = {
    gold:
      'bg-gradient-to-br from-gold-500 to-gold-600 text-white border-white shadow-gold-500/40',
    royal:
      'bg-gradient-to-br from-royal-700 to-royal-600 text-white border-white shadow-royal-700/40',
    white:
      'bg-white text-royal-700 border-royal-200 shadow-royal-700/20'
  };
  const positionClass =
    position === 'fixed'
      ? 'fixed top-20 left-3 sm:left-6 z-40'
      : 'relative';

  return (
    <Link
      href="/"
      title="العودة للصفحة الرئيسية"
      aria-label="الصفحة الرئيسية"
      className={`${positionClass} group inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-2xl border-2 ${variants[variant]} shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 backdrop-blur-md no-print`}
    >
      <span className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-y-0.5 transition-transform"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold-400 rounded-full animate-pulse"></span>
      </span>
      <span className="hidden sm:inline text-sm font-extrabold">الرئيسية</span>
    </Link>
  );
}
