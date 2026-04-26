'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HomeButton from '@/components/HomeButton';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({ users: 0, quizzes: 0, results: 0, summaries: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user || !d.user.isAdmin) { router.push('/login'); return; }
      setUser(d.user);
      Promise.all([
        fetch('/api/admin/users').then((r) => r.json()),
        fetch('/api/quizzes?all=1').then((r) => r.json()),
        fetch('/api/results').then((r) => r.json()),
        fetch('/api/summaries').then((r) => r.json())
      ]).then(([u, q, r, s]) => {
        setStats({
          users: u.users?.length || 0,
          quizzes: q.quizzes?.length || 0,
          results: r.results?.length || 0,
          summaries: s.summaries?.length || 0
        });
        setLoading(false);
      });
    });
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="spinner"></div>
        <div className="text-gray-500 font-bold">جاري التحميل...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* العنوان */}
        <div className="relative bg-gradient-to-l from-royal-900 via-royal-700 to-royal-600 rounded-3xl p-7 shadow-2xl mb-6 text-white overflow-hidden animate-fade-in-up">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-gold-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 opacity-10 dot-pattern"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl border-2 border-white">
              ⚙️
            </div>
            <div className="flex-1">
              <div className="text-xs opacity-80 font-bold mb-1">👑 لوحة التحكم</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow-lg">أهلاً بعودتك، {user?.name}</h1>
              <p className="opacity-90 text-sm mt-1">إدارة كاملة للمنصة التعليمية</p>
            </div>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon="👥" label="المستخدمين" value={stats.users} color="from-royal-700 to-royal-500" />
          <StatCard icon="📝" label="الاختبارات" value={stats.quizzes} color="from-emerald-500 to-teal-600" />
          <StatCard icon="📊" label="النتائج" value={stats.results} color="from-purple-500 to-fuchsia-600" />
          <StatCard icon="📚" label="التلخيصات" value={stats.summaries} color="from-gold-500 to-gold-600" />
        </div>

        {/* الأزرار */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ActionCard
            href="/admin/quiz/new"
            icon="➕"
            title="إضافة اختبار جديد"
            description="أنشئ اختبار جديد من الصفر مع إضافة أسئلة وخيارات"
            color="from-emerald-500 to-teal-600"
          />
          <ActionCard
            href="/admin/quizzes"
            icon="📝"
            title="إدارة الاختبارات"
            description="عدّل، احذف، أو عطّل الاختبارات الموجودة"
            color="from-royal-700 to-royal-500"
          />
          <ActionCard
            href="/admin/results"
            icon="📊"
            title="نتائج المستخدمين"
            description="استعرض نتائج جميع المستخدمين والتفاصيل"
            color="from-purple-500 to-fuchsia-600"
          />
          <ActionCard
            href="/admin/summary/new"
            icon="📚"
            title="إضافة تلخيص"
            description="أضف صور، فيديوهات يوتيوب، أو روابط ملفات"
            color="from-gold-500 to-gold-600"
          />
          <ActionCard
            href="/admin/summaries"
            icon="📂"
            title="إدارة التلخيصات"
            description="عدّل أو احذف التلخيصات الموجودة"
            color="from-pink-500 to-rose-600"
          />
          <ActionCard
            href="/admin/import-json"
            icon="📥"
            title="استيراد عبر JSON"
            description="استورد اختبارات كاملة باستخدام ملف JSON"
            color="from-cyan-500 to-blue-600"
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-3xl p-5 shadow-xl text-white relative overflow-hidden hover-lift border-2 border-white/30`}>
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/15 rounded-full blur-2xl"></div>
      <div className="relative">
        <div className="text-4xl mb-1 drop-shadow-lg">{icon}</div>
        <div className="text-3xl font-extrabold mt-2 drop-shadow-lg">{value}</div>
        <div className="text-sm opacity-90 mt-1 font-bold">{label}</div>
      </div>
    </div>
  );
}

function ActionCard({ href, icon, title, description, color }: any) {
  return (
    <Link href={href} className="group block card-premium p-6 hover-lift transition-all">
      <div className={`bg-gradient-to-br ${color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform border-2 border-white/40`}>
        {icon}
      </div>
      <h3 className="text-lg font-extrabold text-gray-800 mb-1.5 group-hover:text-royal-700 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      <div className="mt-3 inline-flex items-center gap-1 text-gold-600 font-bold text-sm group-hover:gap-2 transition-all">
        فتح <span>←</span>
      </div>
    </Link>
  );
}
