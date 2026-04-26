'use client';
import { LOGO_URL } from '@/lib/constants';
import Link from 'next/link';

export default function Logo({
  size = 'md',
  linkTo = '/',
  glow = false,
  ring = true
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  linkTo?: string | null;
  glow?: boolean;
  ring?: boolean;
}) {
  const sizes = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
    xl: 'h-32 w-32',
    '2xl': 'h-44 w-44'
  };

  const ringClass = ring
    ? 'ring-4 ring-amber-400/80 ring-offset-2 ring-offset-white/40 shadow-[0_8px_30px_rgba(11,74,155,0.35)]'
    : '';

  const inner = (
    <div
      className={`${sizes[size]} relative rounded-full overflow-hidden bg-gradient-to-br from-white via-blue-50 to-amber-50 ${ringClass} ${glow ? 'logo-shine animate-pulse-slow' : ''} transition-transform hover:scale-105`}
    >
      <img
        src={LOGO_URL}
        alt="اختبر معلوماتك"
        className="w-full h-full object-cover rounded-full"
        loading="eager"
      />
    </div>
  );

  if (!linkTo) return inner;
  return (
    <Link href={linkTo} className="inline-block rounded-full">
      {inner}
    </Link>
  );
}
