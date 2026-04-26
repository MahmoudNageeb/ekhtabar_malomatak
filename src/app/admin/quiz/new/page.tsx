'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import HomeButton from '@/components/HomeButton';
import QuizEditor from '@/components/QuizEditor';

export default function NewQuizPage() {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user?.isAdmin) router.push('/login');
      else setAuthorized(true);
    });
  }, [router]);

  if (!authorized) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />
      <div className="flex-1 flex items-center justify-center text-gray-500">⏳ جاري التحقق...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-slate-100 to-blue-50">
      <Header />
      <HomeButton />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← لوحة التحكم
          </Link>
          <div className="text-gray-400">/</div>
          <h1 className="text-2xl font-extrabold text-gray-800">إضافة اختبار جديد</h1>
        </div>
        <QuizEditor />
      </main>
    </div>
  );
}
