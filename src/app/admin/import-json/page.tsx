'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HomeButton from '@/components/HomeButton';

const SAMPLE = {
  title: "اختبار رياضيات الفصل الأول",
  stage: "primary",
  grade: "grade-1",
  term: "term-1", // 🆕 الفصل الدراسي: term-1 أو term-2
  duration: 15,
  questions: [
    {
      type: "mcq",
      questionText: "ما هو ناتج 2 + 3؟",
      optionA: "4",
      optionB: "5",
      optionC: "6",
      optionD: "7",
      correctAnswer: "B"
    },
    {
      type: "mcq",
      questionText: "ما هو ناتج 10 - 4؟",
      optionA: "5",
      optionB: "6",
      optionC: "7",
      correctAnswer: "B"
    },
    {
      type: "tf",
      questionText: "1 + 1 = 2",
      correctAnswer: "true"
    }
  ]
};

const SAMPLE_MULTI = [
  SAMPLE,
  { ...SAMPLE, title: "اختبار الترم الثاني", term: "term-2" }
];

export default function ImportJsonPage() {
  const [json, setJson] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      if (!d.user?.isAdmin) router.push('/login');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    let data: any;
    try { data = JSON.parse(json); }
    catch { return setError('JSON غير صحيح. تأكد من الصياغة'); }

    setLoading(true);
    const res = await fetch('/api/admin/import-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    setLoading(false);
    if (!res.ok) return setError(result.error || 'خطأ');
    setSuccess(`✅ تم استيراد ${result.count} اختبار بنجاح!`);
    setJson('');
    setTimeout(() => router.push('/admin/quizzes'), 1500);
  }

  function loadSample(multi = false) {
    setJson(JSON.stringify(multi ? SAMPLE_MULTI : SAMPLE, null, 2));
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-bl from-slate-100 to-cyan-50">
      <Header />
      <HomeButton />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        <div className="flex items-center gap-3 mb-5">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-semibold">← لوحة التحكم</Link>
          <div className="text-gray-400">/</div>
          <h1 className="text-2xl font-extrabold text-gray-800">استيراد عبر JSON</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-cyan-100 mb-5">
          <h2 className="font-extrabold text-gray-800 mb-3 flex items-center gap-2">
            <span>📖</span> دليل استخدام JSON
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            يمكنك استيراد اختبار واحد (object) أو عدة اختبارات (array). الصياغة المتوقعة:
          </p>
          <div className="bg-slate-900 text-emerald-300 p-4 rounded-2xl text-xs sm:text-sm font-mono overflow-x-auto" dir="ltr">
            <pre>{JSON.stringify(SAMPLE, null, 2)}</pre>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded-2xl">
              <div className="font-bold text-blue-800 mb-1">📌 الحقول المطلوبة:</div>
              <ul className="text-gray-700 space-y-0.5 mr-4 list-disc">
                <li>title - عنوان الاختبار</li>
                <li>stage - "primary" أو "preparatory"</li>
                <li>grade - "grade-1" إلى "grade-6"</li>
                <li>duration - المدة بالدقائق</li>
                <li>questions - مصفوفة الأسئلة</li>
              </ul>
            </div>
            {/* 🆕 شرح حقل الفصل الدراسي */}
            <div className="bg-amber-50 p-3 rounded-2xl sm:col-span-2 border-2 border-amber-200">
              <div className="font-bold text-amber-800 mb-1">📅 الفصل الدراسي (term):</div>
              <ul className="text-gray-700 space-y-0.5 mr-4 list-disc">
                <li><span className="font-mono font-bold" dir="ltr">"term": "term-1"</span> ← الفصل الدراسي الأول</li>
                <li><span className="font-mono font-bold" dir="ltr">"term": "term-2"</span> ← الفصل الدراسي الثاني</li>
                <li>لو لم يتم تحديد الترم يتم اعتباره <span className="font-bold">الترم الثاني</span> تلقائيًا (للحفاظ على التوافق)</li>
              </ul>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl">
              <div className="font-bold text-emerald-800 mb-1">📌 أنواع الأسئلة:</div>
              <ul className="text-gray-700 space-y-0.5 mr-4 list-disc">
                <li>type: "mcq" - اختيار من متعدد</li>
                <li>type: "tf" - صح / خطأ</li>
                <li>correctAnswer للـ mcq: A/B/C/D</li>
                <li>correctAnswer للـ tf: true/false</li>
                <li>optionD اختياري</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => loadSample(false)} className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-xl font-bold text-sm hover:bg-cyan-200 transition">
              📥 تحميل مثال (اختبار واحد)
            </button>
            <button onClick={() => loadSample(true)} className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-xl font-bold text-sm hover:bg-cyan-200 transition">
              📥 تحميل مثال (عدة اختبارات)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 border-2 border-cyan-100">
          <label className="block text-sm font-bold text-gray-700 mb-2">JSON الاختبار</label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-500 font-mono text-sm bg-slate-900 text-emerald-300 resize-none"
            placeholder='{"title": "...", "stage": "primary", "grade": "grade-1", "term": "term-1", "duration": 15, "questions": [...]}'
            dir="ltr"
            required
          />

          {error && <div className="mt-3 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl font-semibold">⚠️ {error}</div>}
          {success && <div className="mt-3 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl font-semibold">{success}</div>}

          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-l from-cyan-500 to-blue-600 text-white rounded-2xl font-extrabold shadow-lg btn-shine disabled:opacity-50">
              {loading ? '⏳ جاري الاستيراد...' : '📥 استيراد الآن'}
            </button>
            <Link href="/admin" className="flex-1 text-center py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">
              إلغاء
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
