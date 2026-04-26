'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRIMARY_GRADES, ARABIC_LETTERS } from '@/lib/constants';

type Q = {
  questionText: string;
  type: 'mcq' | 'tf';
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
};

const emptyQ = (): Q => ({
  questionText: '',
  type: 'mcq',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A'
});

export default function QuizEditor({ initial, quizId }: { initial?: any; quizId?: number }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || '');
  const [stage, setStage] = useState(initial?.stage || 'primary');
  const [grade, setGrade] = useState(initial?.grade || 'grade-1');
  const [duration, setDuration] = useState(initial?.duration || 15);
  const [questions, setQuestions] = useState<Q[]>(
    initial?.questions?.length
      ? initial.questions.map((q: any) => ({
          questionText: q.questionText,
          type: q.type,
          optionA: q.optionA || '',
          optionB: q.optionB || '',
          optionC: q.optionC || '',
          optionD: q.optionD || '',
          correctAnswer: q.correctAnswer
        }))
      : [emptyQ()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    refs.current[activeIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIdx]);

  function updateQ(idx: number, updates: Partial<Q>) {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, ...updates } : q));
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQ()]);
    setActiveIdx(questions.length);
  }

  function removeQuestion(idx: number) {
    if (questions.length === 1) {
      alert('يجب أن يكون هناك سؤال واحد على الأقل');
      return;
    }
    if (!confirm('حذف هذا السؤال؟')) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    setActiveIdx(Math.max(0, idx - 1));
  }

  function moveTo(direction: 'prev' | 'next') {
    if (direction === 'prev' && activeIdx > 0) setActiveIdx(activeIdx - 1);
    if (direction === 'next' && activeIdx < questions.length - 1) setActiveIdx(activeIdx + 1);
  }

  // التنقل بالأسهم بين الحقول
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); moveTo('next'); }
    if (e.key === 'ArrowUp' && e.altKey) { e.preventDefault(); moveTo('prev'); }
  }

  async function handleSave() {
    setError('');
    if (!title.trim()) return setError('أدخل عنوان الاختبار');
    if (!duration || duration < 1) return setError('أدخل مدة صحيحة');
    if (!questions.length) return setError('أضف سؤالاً واحدًا على الأقل');

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return setError(`السؤال ${i + 1}: نص السؤال مطلوب`);
      if (q.type === 'mcq') {
        if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim()) {
          return setError(`السؤال ${i + 1}: يجب ملء الاختيارات أ، ب، ج على الأقل`);
        }
        if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
          return setError(`السؤال ${i + 1}: حدد مفتاح الإجابة الصحيحة`);
        }
        if (q.correctAnswer === 'D' && !q.optionD.trim()) {
          return setError(`السؤال ${i + 1}: لا يمكن جعل الاختيار (د) صحيحًا وهو فارغ`);
        }
      } else {
        if (!['true', 'false'].includes(q.correctAnswer)) {
          return setError(`السؤال ${i + 1}: حدد مفتاح الإجابة (صح/خطأ)`);
        }
      }
    }

    setSaving(true);
    const url = quizId ? `/api/quizzes/${quizId}` : '/api/quizzes';
    const method = quizId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, stage, grade, duration: Number(duration), questions })
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error || 'خطأ');
    router.push('/admin/quizzes');
  }

  const grades = stage === 'primary' ? PRIMARY_GRADES : [
    { id: 'prep-1', name: 'الصف الأول الإعدادي' },
    { id: 'prep-2', name: 'الصف الثاني الإعدادي' },
    { id: 'prep-3', name: 'الصف الثالث الإعدادي' }
  ];

  return (
    <div onKeyDown={handleKeyDown} className="space-y-6">
      {/* بيانات الاختبار */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100">
        <h2 className="text-xl font-extrabold text-gray-800 mb-4">📋 بيانات الاختبار</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">عنوان الاختبار</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500"
              placeholder="مثال: اختبار رياضيات الفصل الأول"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">المرحلة</label>
            <select
              value={stage}
              onChange={(e) => {
                setStage(e.target.value);
                setGrade(e.target.value === 'primary' ? 'grade-1' : 'prep-1');
              }}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="primary">المرحلة الابتدائية</option>
              <option value="preparatory">المرحلة الإعدادية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">الصف</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500 bg-white"
            >
              {grades.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">المدة (بالدقائق)</label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* شريط التنقل بين الأسئلة */}
      <div className="bg-white rounded-3xl shadow-xl p-4 border-2 border-blue-100 sticky top-20 z-30">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => moveTo('prev')}
            disabled={activeIdx === 0}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 disabled:opacity-30 transition"
            title="السؤال السابق (Alt + ↑)"
          >
            ↑
          </button>
          <div className="flex-1 text-center font-bold text-gray-700">
            السؤال {activeIdx + 1} من {questions.length}
          </div>
          <button
            onClick={() => moveTo('next')}
            disabled={activeIdx === questions.length - 1}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 disabled:opacity-30 transition"
            title="السؤال التالي (Alt + ↓)"
          >
            ↓
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${i === activeIdx ? 'bg-blue-600 text-white shadow-md scale-110' : q.questionText.trim() ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">💡 استخدم Alt + ↑ / ↓ للتنقل بين الأسئلة</p>
      </div>

      {/* الأسئلة */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={idx}
            ref={(el) => { refs.current[idx] = el; }}
            className={`bg-white rounded-3xl shadow-md p-5 border-2 transition-all ${idx === activeIdx ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white shadow-md">
                  {idx + 1}
                </div>
                <span className="font-bold text-gray-700">السؤال {idx + 1}</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={q.type}
                  onChange={(e) => updateQ(idx, {
                    type: e.target.value as any,
                    correctAnswer: e.target.value === 'mcq' ? 'A' : 'true'
                  })}
                  className="px-3 py-1.5 text-sm border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="mcq">اختيار من متعدد</option>
                  <option value="tf">صح / خطأ</option>
                </select>
                <button
                  onClick={() => removeQuestion(idx)}
                  className="px-3 py-1.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition text-sm font-bold"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">نص السؤال</label>
              <textarea
                rows={2}
                value={q.questionText}
                onFocus={() => setActiveIdx(idx)}
                onChange={(e) => updateQ(idx, { questionText: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 resize-none"
                placeholder="اكتب نص السؤال هنا..."
              />
            </div>

            {q.type === 'mcq' ? (
              <div className="mt-3 space-y-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  الاختيارات وحدد الإجابة الصحيحة
                </label>
                {[
                  { key: 'A', value: q.optionA, field: 'optionA' as const },
                  { key: 'B', value: q.optionB, field: 'optionB' as const },
                  { key: 'C', value: q.optionC, field: 'optionC' as const },
                  { key: 'D', value: q.optionD, field: 'optionD' as const, optional: true }
                ].map((opt, i) => {
                  const isSelected = q.correctAnswer === opt.key;
                  return (
                    <div key={opt.key} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQ(idx, { correctAnswer: opt.key })}
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-extrabold transition-all ${isSelected ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-emerald-100'}`}
                        title="اضغط لتحديد الإجابة الصحيحة"
                      >
                        {ARABIC_LETTERS[i]}
                      </button>
                      <input
                        type="text"
                        value={opt.value}
                        onFocus={() => setActiveIdx(idx)}
                        onChange={(e) => updateQ(idx, { [opt.field]: e.target.value })}
                        className={`flex-1 px-4 py-2.5 border-2 rounded-2xl focus:outline-none transition ${isSelected ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 focus:border-blue-500'}`}
                        placeholder={opt.optional ? `الاختيار ${ARABIC_LETTERS[i]} (اختياري)` : `الاختيار ${ARABIC_LETTERS[i]}`}
                      />
                      {isSelected && <span className="text-emerald-600 font-bold text-sm">✓ صحيحة</span>}
                    </div>
                  );
                })}
                <p className="text-xs text-gray-500 mt-2">💡 اضغط على حرف الاختيار (أ/ب/ج/د) لتحديده كإجابة صحيحة</p>
              </div>
            ) : (
              <div className="mt-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">الإجابة الصحيحة</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateQ(idx, { correctAnswer: 'true' })}
                    className={`py-3 rounded-2xl font-bold transition-all border-2 ${q.correctAnswer === 'true' ? 'border-emerald-500 bg-emerald-100 text-emerald-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-emerald-50'}`}
                  >
                    ✓ صح
                  </button>
                  <button
                    type="button"
                    onClick={() => updateQ(idx, { correctAnswer: 'false' })}
                    className={`py-3 rounded-2xl font-bold transition-all border-2 ${q.correctAnswer === 'false' ? 'border-red-500 bg-red-100 text-red-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-red-50'}`}
                  >
                    ✗ خطأ
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* زر إضافة سؤال - بعد آخر سؤال */}
        <button
          onClick={addQuestion}
          className="w-full py-4 bg-gradient-to-l from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-extrabold shadow-lg btn-shine transition-all"
        >
          ➕ إضافة سؤال جديد
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* أزرار الحفظ */}
      <div className="flex flex-wrap gap-3 sticky bottom-3 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-2xl border-2 border-blue-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 min-w-[150px] py-3 bg-gradient-to-l from-emerald-500 to-teal-600 text-white rounded-2xl font-extrabold shadow-lg btn-shine disabled:opacity-50"
        >
          {saving ? '⏳ جاري الحفظ...' : '💾 حفظ ونشر الاختبار'}
        </button>
        <Link
          href="/admin/quizzes"
          className="flex-1 min-w-[150px] text-center py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition"
        >
          إلغاء
        </Link>
      </div>
    </div>
  );
}
