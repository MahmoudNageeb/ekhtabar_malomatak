'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import HomeButton from '@/components/HomeButton';
import QuizEditor from '@/components/QuizEditor';

export default function EditQuizPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user?.isAdmin) { router.push('/login'); return; }
      fetch(`/api/quizzes/${params.id}`).then((r) => r.json()).then((data) => {
        setQuiz(data.quiz);
        setLoading(false);
      });
    });
  }, [router, params.id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HomeButton />
      <div className="flex-1 flex items-center justify-center text-gray-500">⏳ جاري التحميل...</div>
    </div>
  );

  if (!quiz) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-slate-100 to-blue-50">
      <Header />
      <HomeButton />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/admin/quizzes" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← الاختبارات
          </Link>
          <div className="text-gray-400">/</div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 truncate">تعديل: {quiz.title}</h1>
        </div>
        <QuizEditor initial={quiz} quizId={params.id} />
      </main>
    </div>
  );
}
