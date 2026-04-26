'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import HomeButton from '@/components/HomeButton';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
    if (data.user?.isAdmin) router.push('/admin');
    else router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* خلفية متدرجة + أشكال */}
      <div className="absolute inset-0 bg-gradient-to-bl from-royal-50 via-white to-gold-50/50"></div>
      <div className="absolute inset-0 pattern-bg"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-royal-300/30 rounded-full blur-3xl floating-shape"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold-300/40 rounded-full blur-3xl floating-shape"></div>

      <HomeButton variant="royal" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="glass-card rounded-3xl shadow-2xl p-7 sm:p-10 border-2 border-gold-200/50">
          <div className="text-center mb-7">
            <Logo size="xl" linkTo={null} glow />
            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold shimmer-text">تسجيل الدخول</h1>
            <p className="mt-3 text-gray-600 text-sm font-semibold">
              👋 أهلاً بعودتك! ادخل لاستئناف رحلتك نحو التفوق
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 animate-fade-in">
              <span className="text-xl">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-extrabold text-royal-700 mb-2 flex items-center gap-2">
                <span>👤</span> الاسم
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-royal-200 rounded-2xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 transition font-semibold"
                placeholder="ادخل اسمك"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-royal-700 mb-2 flex items-center gap-2">
                <span>🔑</span> كلمة السر
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-royal-200 rounded-2xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 transition font-semibold"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-l from-royal-700 to-royal-600 hover:from-gold-500 hover:to-gold-600 text-white rounded-2xl font-extrabold text-lg shadow-lg shadow-royal-700/30 hover:shadow-2xl hover:shadow-gold-500/40 btn-shine transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  جاري الدخول...
                </span>
              ) : (
                <span>🚀 دخول إلى المنصة</span>
              )}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t-2 border-dashed border-royal-200 text-center">
            <span className="text-gray-600 text-sm">ليس لديك حساب؟</span>{' '}
            <Link href="/register" className="text-gold-600 font-extrabold hover:text-royal-700 transition-colors">
              ✨ أنشئ حسابك الآن
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          🔒 بياناتك آمنة ومشفرة بالكامل
        </div>
      </div>
    </div>
  );
}
