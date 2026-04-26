'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import { PRIMARY_GRADES } from '@/lib/constants';

export default function Header({ showHome = true }: { showHome?: boolean }) {
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [matchedGrades, setMatchedGrades] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user));
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      setResults([]);
      setMatchedGrades([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/quizzes?search=${encodeURIComponent(term)}`);
        const d = await r.json();
        setResults(d.quizzes || []);
        // البحث في أسماء الصفوف أيضاً
        const grades = PRIMARY_GRADES.filter(
          (g) => g.name.includes(term) || g.short.includes(term) || g.id.includes(term)
        );
        setMatchedGrades(grades);
        setShowResults(true);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim().length >= 1) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setShowResults(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b-2 border-gold-300/40">
      {/* خط ذهبي علوي */}
      <div className="h-1 bg-gradient-to-r from-royal-700 via-gold-500 to-royal-700"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
        {/* اللوجو */}
        <Logo size="md" linkTo="/" />

        {/* اسم الموقع */}
        <Link href="/" className="hidden md:block">
          <h1 className="text-xl lg:text-2xl font-extrabold shimmer-text leading-tight">
            اختبر معلوماتك
          </h1>
          <div className="text-[10px] text-gold-600 font-bold tracking-wider">
            ✦ منصة التفوق ✦
          </div>
        </Link>

        {/* شريط البحث */}
        <div className="flex-1 relative" ref={searchRef}>
          <form onSubmit={submitSearch}>
            <div className="relative group">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => (results.length || matchedGrades.length) && setShowResults(true)}
                placeholder="🔍 ابحث عن اختبار، مادة، أو صف دراسي..."
                className="w-full pr-12 pl-12 py-2.5 sm:py-3 bg-gradient-to-l from-royal-50 via-white to-gold-50/30 border-2 border-royal-200 rounded-2xl focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-200/50 transition-all text-sm sm:text-base font-semibold placeholder:font-normal placeholder:text-gray-400"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-royal-700 group-focus-within:text-gold-600 transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searching ? (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-royal-200 border-t-gold-500 rounded-full animate-spin"></div>
              ) : search.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setShowResults(false); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* نتائج البحث المنسدلة */}
          {showResults && search.length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-3xl shadow-2xl border-2 border-gold-200 overflow-hidden max-h-[26rem] overflow-y-auto z-50 animate-fade-in-up">
              {(matchedGrades.length === 0 && results.length === 0) ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <div className="font-bold">لا توجد نتائج لـ "{search}"</div>
                  <div className="text-xs mt-1">جرب كلمات أخرى</div>
                </div>
              ) : (
                <>
                  {matchedGrades.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gradient-to-l from-royal-700 to-royal-600 text-white text-xs font-bold flex items-center gap-2">
                        <span>📚</span>
                        <span>الصفوف الدراسية ({matchedGrades.length})</span>
                      </div>
                      {matchedGrades.map((g) => (
                        <Link
                          key={g.id}
                          href={`/grade/${g.id}`}
                          onClick={() => { setShowResults(false); setSearch(''); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gold-50 border-b border-gray-100 transition-colors group"
                        >
                          <img src={g.image} alt={g.name} className="w-12 h-12 rounded-xl object-cover border border-royal-200" />
                          <div className="flex-1">
                            <div className="font-bold text-royal-700 group-hover:text-gold-600 transition-colors">{g.name}</div>
                            <div className="text-xs text-gray-500">المرحلة الابتدائية</div>
                          </div>
                          <span className="text-royal-400 group-hover:translate-x-1 transition-transform">←</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {results.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-gradient-to-l from-gold-500 to-gold-600 text-white text-xs font-bold flex items-center gap-2">
                        <span>📝</span>
                        <span>الاختبارات ({results.length})</span>
                      </div>
                      {results.slice(0, 8).map((q) => (
                        <Link
                          key={q.id}
                          href={`/quiz/${q.id}`}
                          onClick={() => { setShowResults(false); setSearch(''); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-royal-50 border-b border-gray-100 last:border-0 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-royal-700 to-royal-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                            📝
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 truncate group-hover:text-royal-700 transition-colors">{q.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                              <span>{q.grade}</span>
                              <span>•</span>
                              <span>{q.questionCount} سؤال</span>
                              <span>•</span>
                              <span>{q.duration} دقيقة</span>
                            </div>
                          </div>
                          <span className="text-royal-400 group-hover:translate-x-1 transition-transform flex-shrink-0">←</span>
                        </Link>
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(search)}`}
                        onClick={() => { setShowResults(false); }}
                        className="block py-3 bg-gradient-to-l from-royal-50 to-gold-50 text-center font-bold text-royal-700 hover:text-gold-600 transition-colors"
                      >
                        عرض كل النتائج ←
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* زر الصفحة الرئيسية */}
        {showHome && (
          <Link
            href="/"
            className="hidden sm:flex items-center justify-center w-11 h-11 bg-gradient-to-br from-gold-500 to-gold-600 text-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-110 hover:-rotate-6 transition-all border-2 border-white"
            title="الصفحة الرئيسية"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>
        )}

        {/* القائمة المنسدلة */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-br from-royal-700 to-royal-600 text-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all border-2 border-white/40"
          >
            {user ? (
              <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center text-xs font-bold border-2 border-white">
                {user.name.charAt(0)}
              </div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            {user && <span className="hidden sm:inline text-sm font-bold max-w-[120px] truncate">{user.name}</span>}
          </button>

          {menuOpen && (
            <div className="absolute left-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border-2 border-gold-200 overflow-hidden z-50 toast">
              {user ? (
                <>
                  <div className="px-5 py-5 bg-gradient-to-bl from-royal-700 via-royal-600 to-royal-500 text-white relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-gold-500/30 rounded-full blur-2xl"></div>
                    <div className="relative">
                      <div className="text-xs opacity-80">مرحبًا بك</div>
                      <div className="font-extrabold text-lg mt-0.5 break-words">{user.name}</div>
                      {user.isAdmin && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-gold-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          👑 أدمن
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-royal-50 transition-colors">
                    <span className="text-xl">👤</span>
                    <span className="font-bold text-gray-700">الصفحة الشخصية</span>
                  </Link>
                  <Link href="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-royal-50 transition-colors border-t border-gray-100">
                    <span className="text-xl">⭐</span>
                    <span className="font-bold text-gray-700">المفضلة</span>
                  </Link>
                  <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-royal-50 transition-colors border-t border-gray-100">
                    <span className="text-xl">🏆</span>
                    <span className="font-bold text-gray-700">قائمة الأوائل</span>
                  </Link>
                  {user.isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-gold-50 transition-colors border-t border-gray-100">
                      <span className="text-xl">⚙️</span>
                      <span className="font-bold text-gray-700">لوحة التحكم</span>
                    </Link>
                  )}
                  <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors border-t border-gray-100 text-right">
                    <span className="text-xl">🚪</span>
                    <span className="font-bold text-red-600">تسجيل الخروج</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="px-5 py-4 bg-gradient-to-bl from-royal-700 to-royal-600 text-white text-center">
                    <div className="font-bold">أهلاً بك في المنصة 👋</div>
                    <div className="text-xs opacity-80 mt-1">سجل لتدخل عالم التفوق</div>
                  </div>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-royal-50 transition-colors">
                    <span className="text-xl">🔐</span>
                    <span className="font-bold text-gray-700">تسجيل الدخول</span>
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-royal-50 transition-colors border-t border-gray-100">
                    <span className="text-xl">📝</span>
                    <span className="font-bold text-gray-700">إنشاء حساب جديد</span>
                  </Link>
                  <Link href="/leaderboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-royal-50 transition-colors border-t border-gray-100">
                    <span className="text-xl">🏆</span>
                    <span className="font-bold text-gray-700">الأوائل</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
