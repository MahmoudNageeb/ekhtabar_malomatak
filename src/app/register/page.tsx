'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import HomeButton from '@/components/HomeButton';
import { PRIMARY_GRADES } from '@/lib/constants';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState('primary');
  const [grade, setGrade] = useState('grade-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const preparatoryGrades = [
    { id: 'prep-1', name: 'الصف الأول الإعدادي' },
    { id: 'prep-2', name: 'الصف الثاني الإعدادي' },
    { id: 'prep-3', name: 'الصف الثالث الإعدادي' }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, stage, grade })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
    router.push('/');
    router.refresh();
  }

  function handleStageChange(s: string) {
    setStage(s);
    setGrade(s === 'primary' ? 'grade-1' : 'prep-1');
  }

  const grades = stage === 'primary' ? PRIMARY_GRADES : preparatoryGrades;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-gold-50/40 via-white to-royal-50/60"></div>
      <div className="absolute inset-0 pattern-bg"></div>
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-gold-300/40 rounded-full blur-3xl floating-shape"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-royal-300/40 rounded-full blur-3xl floating-shape"></div>

      <HomeButton variant="gold" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="glass-card rounded-3xl shadow-2xl p-7 sm:p-10 border-2 border-royal-200/50">
          <div className="text-center mb-6">
            <Logo size="xl" linkTo={null} glow />
            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold shimmer-text">إنشاء حساب جديد</h1>
            <p className="mt-3 text-gray-600 text-sm font-semibold">
              ✨ انضم لآلاف الطلاب وابدأ تحدي التفوق الآن!
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
                <span>👤</span> الاسم بالكامل
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-royal-200 rounded-2xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 transition font-semibold"
                placeholder="مثال: أحمد محمد علي"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-royal-700 mb-2 flex items-center gap-2">
                <span>🎓</span> المرحلة الدراسية
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleStageChange('primary')}
                  className={`py-4 rounded-2xl border-2 font-extrabold transition-all ${
                    stage === 'primary'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-lg shadow-emerald-200 scale-105'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🎒</div>
                  <div className="text-sm">المرحلة الابتدائية</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleStageChange('preparatory')}
                  className={`py-4 rounded-2xl border-2 font-extrabold transition-all ${
                    stage === 'preparatory'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-lg shadow-purple-200 scale-105'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">📚</div>
                  <div className="text-sm">المرحلة الإعدادية</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-royal-700 mb-2 flex items-center gap-2">
                <span>📖</span> الصف الدراسي
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-royal-200 rounded-2xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 font-bold text-royal-700"
              >
                {grades.map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-royal-700 mb-2 flex items-center gap-2">
                <span>🔑</span> كلمة السر
              </label>
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white border-2 border-royal-200 rounded-2xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 transition font-semibold"
                placeholder="•••••••• (4 حروف على الأقل)"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-l from-gold-500 to-gold-600 hover:from-royal-700 hover:to-royal-600 text-white rounded-2xl font-extrabold text-lg shadow-lg shadow-gold-500/30 hover:shadow-2xl hover:shadow-royal-700/40 btn-shine transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  جاري الإنشاء...
                </span>
              ) : (
                <span>✨ إنشاء حسابي الآن</span>
              )}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t-2 border-dashed border-royal-200 text-center">
            <span className="text-gray-600 text-sm">لديك حساب بالفعل؟</span>{' '}
            <Link href="/login" className="text-royal-700 font-extrabold hover:text-gold-600 transition-colors">
              🔐 سجل دخولك
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          🎯 ابدأ رحلتك التعليمية مع منصة اختبر معلوماتك
        </div>
      </div>
    </div>
  );
}
