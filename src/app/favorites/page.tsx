'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomeButton from '@/components/HomeButton';

export default function FavoritesPage() {
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user) { router.push('/login'); return; }
      fetch('/api/favorites').then((r) => r.json()).then((data) => {
        setFavs(data.favorites || []);
        setLoading(false);
      });
    });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-royal-700 font-bold flex items-center gap-1">
            <span>🏠</span> الرئيسية
          </Link>
          <span>›</span>
          <span className="text-pink-600 font-bold">المفضلة</span>
        </div>

        {/* Hero */}
        <div className="relative bg-gradient-to-l from-pink-500 via-rose-500 to-red-500 rounded-3xl p-8 shadow-2xl text-white text-center mb-6 overflow-hidden animate-fade-in-up">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/15 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="text-7xl mb-3 animate-float inline-block">⭐</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold drop-shadow-lg">المفضلة</h1>
            <p className="opacity-95 mt-2 font-semibold">اختباراتك المحفوظة في مكان واحد</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-16">
            <div className="spinner"></div>
            <div className="mt-4 text-gray-500 font-bold">جاري التحميل...</div>
          </div>
        ) : favs.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border-2 border-dashed border-pink-200">
            <div className="text-7xl mb-4 animate-bounce-slow">⭐</div>
            <p className="text-xl font-extrabold text-royal-700">لا توجد اختبارات في مفضلتك</p>
            <p className="text-gray-500 mt-2">أضف اختباراتك المفضلة لتجدها هنا بسهولة</p>
            <Link href="/stage/primary" className="inline-block mt-5 btn-royal btn-shine">
              🚀 تصفح الاختبارات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favs.map((f, i) => (
              <Link
                key={f.id}
                href={`/quiz/${f.quiz.id}`}
                className="card-premium p-5 hover-lift group animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 6) * 0.06}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:rotate-12 transition-transform">
                    ⭐
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-gray-800 group-hover:text-royal-700 transition-colors line-clamp-2">{f.quiz.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs px-2.5 py-1 bg-royal-50 text-royal-700 rounded-full font-bold border border-royal-200">{f.quiz.grade}</span>
                      <span className="text-xs px-2.5 py-1 bg-gold-50 text-gold-700 rounded-full font-bold border border-gold-200">⏱️ {f.quiz.duration} د</span>
                    </div>
                  </div>
                  <span className="text-pink-500 text-xl group-hover:translate-x-[-4px] transition-transform">←</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
