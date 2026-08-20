'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';
import { PRIMARY_GRADES, TERMS, DEFAULT_TERM, getTerm } from '@/lib/constants';

export default function SummariesPage() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState('');
  // 🆕 اختيار الفصل الدراسي (افتراضيًا الترم الثاني)
  const [filterTerm, setFilterTerm] = useState<string>(DEFAULT_TERM);
  const activeTerm = getTerm(filterTerm);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (filterGrade) qs.set('grade', filterGrade);
    if (filterTerm) qs.set('term', filterTerm);
    const url = qs.toString() ? `/api/summaries?${qs.toString()}` : '/api/summaries';
    fetch(url).then((r) => r.json()).then((d) => {
      setSummaries(d.summaries || []);
      setLoading(false);
    });
  }, [filterGrade, filterTerm]);

  // إزالة التكرار
  const unique = (() => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const s of summaries) {
      const key = (s.imageUrl || s.url || '') + s.title;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
    }
    return out;
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton variant="white" />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
            <span>🏠</span> الرئيسية
          </Link>
          <span>›</span>
          <span className="text-gold-600 font-bold">التلخيصات</span>
        </div>

        {/* Hero Banner */}
        <div className="relative bg-gradient-to-l from-gold-500 via-amber-500 to-orange-500 rounded-3xl p-8 shadow-2xl mb-6 text-white overflow-hidden animate-fade-in-up">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-royal-500/30 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-10 dot-pattern"></div>

          <div className="relative text-center">
            <div className="text-7xl mb-3 inline-block animate-float">📚</div>
            <h1 className="text-3xl sm:text-5xl font-extrabold drop-shadow-lg">التلخيصات</h1>
            <p className="opacity-95 mt-3 text-base sm:text-lg font-semibold max-w-2xl mx-auto">
              ✨ مكتبة شاملة من التلخيصات والمراجعات لجميع الصفوف الدراسية
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/40 font-bold">
                📖 {unique.length} تلخيص متاح
              </span>
              {/* 🆕 شارة الفصل الدراسي الحالي */}
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/25 backdrop-blur-sm rounded-full border-2 border-white/50 font-extrabold">
                {activeTerm.emoji} {activeTerm.name}
              </span>
            </div>
          </div>
        </div>

        {/* 🆕 اختيار الفصل الدراسي */}
        <section id="summaries-term-select" className="mb-5 glass-card rounded-3xl shadow-md p-5 border-2 border-royal-200">
          <label className="block text-sm font-extrabold text-royal-700 mb-3 flex items-center gap-2">
            <span>📅</span> اختر الفصل الدراسي:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TERMS.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterTerm(t.id)}
                className={`px-5 py-3.5 rounded-2xl font-extrabold transition-all border-2 ${
                  filterTerm === t.id
                    ? `bg-gradient-to-l ${t.gradient} text-white border-white shadow-lg scale-[1.02]`
                    : 'bg-white border-gray-200 text-gray-600 hover:border-royal-300'
                }`}
              >
                <span className="text-xl ml-1">{t.emoji}</span> {t.name}
              </button>
            ))}
          </div>
        </section>

        {/* فلترة حسب الصف */}
        <div className="mb-6 glass-card rounded-3xl shadow-md p-5 border-2 border-gold-200">
          <label className="block text-sm font-extrabold text-royal-700 mb-3 flex items-center gap-2">
            <span>🎯</span> فلترة حسب الصف الدراسي:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterGrade('')}
              className={`px-5 py-2.5 rounded-2xl font-extrabold transition-all text-sm ${
                !filterGrade
                  ? 'bg-gradient-to-l from-royal-700 to-royal-600 text-white shadow-lg shadow-royal-700/30 scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-royal-300'
              }`}
            >
              📚 جميع الصفوف
            </button>
            {PRIMARY_GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => setFilterGrade(g.id)}
                className={`px-4 py-2.5 rounded-2xl font-extrabold transition-all text-sm ${
                  filterGrade === g.id
                    ? 'bg-gradient-to-l from-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/30 scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-gold-300'
                }`}
              >
                {g.short}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="spinner"></div>
            <div className="mt-4 text-gray-500 font-bold">جاري التحميل...</div>
          </div>
        ) : unique.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border-2 border-dashed border-gold-200">
            <div className="text-7xl mb-4 animate-bounce-slow">📚</div>
            <p className="text-gray-700 font-extrabold text-lg">لا توجد تلخيصات في {activeTerm.name} بعد</p>
            <p className="text-gray-500 mt-2">سيتم إضافة تلخيصات قريبًا — تابعنا!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {unique.map((s, i) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group card-premium overflow-hidden hover-lift animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="aspect-square overflow-hidden bg-gradient-to-br from-gold-100 to-amber-100 relative">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700" />
                  ) : s.type === 'image' ? (
                    <img src={s.url} alt={s.title} className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {s.type === 'youtube' ? '🎥' : '📄'}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md border border-gold-200">
                    {s.type === 'youtube' ? '🎥 فيديو' : s.type === 'file' ? '📄 ملف' : '🖼️ صورة'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                    <span className="px-3 py-1.5 bg-gold-500 text-white text-xs font-extrabold rounded-full shadow-xl">عرض ←</span>
                  </div>
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-extrabold text-gray-800 text-sm line-clamp-2 group-hover:text-royal-700 transition-colors min-h-[2.5rem]">{s.title}</h3>
                  {s.grade && (
                    <p className="text-[10px] text-gold-600 font-bold mt-1">
                      {PRIMARY_GRADES.find((g) => g.id === s.grade)?.short || s.grade}
                    </p>
                  )}
                  {/* 🆕 اسم الفصل الدراسي */}
                  <p className={`text-[10px] font-bold mt-0.5 ${getTerm(s.term).text}`}>
                    {getTerm(s.term).emoji} {getTerm(s.term).short}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
