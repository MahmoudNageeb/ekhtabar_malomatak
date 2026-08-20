'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRIMARY_GRADES, ARABIC_LETTERS, TERMS, DEFAULT_TERM } from '@/lib/constants';
import ImageUpload from './ImageUpload';

type Q = {
  questionText: string;
  type: 'mcq' | 'tf';
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  points: number;
  imageUrl: string;
};

const emptyQ = (): Q => ({
  questionText: '',
  type: 'mcq',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  points: 1,
  imageUrl: ''
});

export default function QuizEditor({ initial, quizId }: { initial?: any; quizId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || '');
  const [stage, setStage] = useState(initial?.stage || 'primary');
  const [grade, setGrade] = useState(initial?.grade || 'grade-1');
  // 🆕 الفصل الدراسي
  const [term, setTerm] = useState(initial?.term || DEFAULT_TERM);
  const [duration, setDuration] = useState(initial?.duration || 15);
  const [passingScore, setPassingScore] = useState(initial?.passingScore ?? 50);
  const [coverImage, setCoverImage] = useState(initial?.coverImage || '');
  const [questions, setQuestions] = useState<Q[]>(
    initial?.questions?.length
      ? initial.questions.map((q: any) => ({
          questionText: q.questionText,
          type: q.type,
          optionA: q.optionA || '',
          optionB: q.optionB || '',
          optionC: q.optionC || '',
          optionD: q.optionD || '',
          correctAnswer: q.correctAnswer,
          points: q.points ?? 1,
          imageUrl: q.imageUrl || ''
        }))
      : [emptyQ()]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const totalPoints = useMemo(() =>
    questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    [questions]
  );

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

  function setAllPoints(value: number) {
    if (!confirm(`تطبيق ${value} نقطة على كل الأسئلة (${questions.length} سؤال)؟`)) return;
    setQuestions((prev) => prev.map((q) => ({ ...q, points: value })));
  }

  function moveTo(direction: 'prev' | 'next') {
    if (direction === 'prev' && activeIdx > 0) setActiveIdx(activeIdx - 1);
    if (direction === 'next' && activeIdx < questions.length - 1) setActiveIdx(activeIdx + 1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); moveTo('next'); }
    if (e.key === 'ArrowUp' && e.altKey) { e.preventDefault(); moveTo('prev'); }
  }

  async function handleSave() {
    setError('');
    if (!title.trim()) return setError('أدخل عنوان الاختبار');
    if (!duration || duration < 1) return setError('أدخل مدة صحيحة');
    if (!questions.length) return setError('أضف سؤالاً واحدًا على الأقل');
    if (passingScore < 0 || passingScore > 100) return setError('نسبة النجاح بين 0 و 100');

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return setError(`السؤال ${i + 1}: نص السؤال مطلوب`);
      if (q.points < 0) return setError(`السؤال ${i + 1}: النقاط لا يمكن أن تكون سالبة`);
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
    // 🆕 PUT للتحديث (يحدّث نفس الاختبار، لا ينشئ جديد)، POST للإنشاء
    const url = quizId ? `/api/quizzes/${quizId}` : '/api/quizzes';
    const method = quizId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, stage, grade, term,
        duration: Number(duration),
        passingScore: Number(passingScore),
        coverImage: coverImage || null,
        questions
      })
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error || 'خطأ');
    router.push('/admin/quizzes');
    router.refresh();
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

          {/* 🆕 اختيار الفصل الدراسي */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">📅 الفصل الدراسي</label>
            <div className="grid grid-cols-2 gap-3">
              {TERMS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTerm(t.id)}
                  className={`p-3.5 rounded-2xl border-2 font-extrabold transition-all ${
                    term === t.id
                      ? `bg-gradient-to-l ${t.gradient} text-white border-white shadow-lg scale-[1.02]`
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="text-xl">{t.emoji}</div>
                  <div className="text-sm mt-1">{t.name}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 الاختبار سيظهر فقط في صفحات الفصل الدراسي المحدد
            </p>
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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">⏱️ المدة (بالدقائق)</label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">🎯 نسبة النجاح (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 🆕 صورة غلاف الاختبار - رفع من الجهاز */}
          <div className="md:col-span-2">
            <ImageUpload
              value={coverImage}
              onChange={setCoverImage}
              folder="ekhtabar/quiz-covers"
              label="🖼️ صورة غلاف الاختبار (اختياري)"
              aspectRatio="wide"
            />
          </div>
        </div>

        {/* 🆕 تنبيه الفصل الدراسي المختار */}
        <div className={`mt-4 rounded-2xl px-4 py-3 border-2 font-bold text-sm flex items-center gap-2 ${TERMS.find((t) => t.id === term)?.bg} ${TERMS.find((t) => t.id === term)?.border} ${TERMS.find((t) => t.id === term)?.text}`}>
          <span className="text-lg">{TERMS.find((t) => t.id === term)?.emoji}</span>
          <span>هذا الاختبار سيُنشر في: {TERMS.find((t) => t.id === term)?.name}</span>
        </div>

        {/* ملخص النقاط */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-blue-600 font-bold mb-1">عدد الأسئلة</div>
            <div className="text-2xl font-extrabold text-blue-700">{questions.length}</div>
          </div>
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-emerald-600 font-bold mb-1">إجمالي النقاط</div>
            <div className="text-2xl font-extrabold text-emerald-700">{totalPoints}</div>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center">
            <div className="text-xs text-amber-600 font-bold mb-1">نقاط النجاح</div>
            <div className="text-2xl font-extrabold text-amber-700">
              {Math.ceil((passingScore / 100) * totalPoints)}
            </div>
          </div>
        </div>

        {/* أدوات سريعة للنقاط */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-bold text-gray-700">تطبيق سريع للنقاط:</span>
          {[1, 2, 3, 5, 10].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAllPoints(p)}
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold text-sm transition"
            >
              {p} لكل سؤال
            </button>
          ))}
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
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white shadow-md">
                  {idx + 1}
                </div>
                <span className="font-bold text-gray-700">السؤال {idx + 1}</span>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                {/* 🆕 نقاط السؤال */}
                <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 rounded-xl px-2 py-1">
                  <span className="text-amber-600 text-sm font-bold">⭐</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={q.points}
                    onChange={(e) => updateQ(idx, { points: Number(e.target.value) })}
                    className="w-16 px-1 py-0.5 bg-transparent border-0 text-amber-700 font-extrabold text-center focus:outline-none"
                    title="نقاط هذا السؤال"
                  />
                  <span className="text-amber-600 text-xs font-bold">نقطة</span>
                </div>

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

            {/* 🆕 صورة السؤال (اختياري) */}
            <div className="mt-3">
              <ImageUpload
                value={q.imageUrl}
                onChange={(url) => updateQ(idx, { imageUrl: url })}
                folder="ekhtabar/questions"
                label="🖼️ صورة السؤال (اختياري)"
                aspectRatio="wide"
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

        {/* زر إضافة سؤال */}
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
          {saving ? '⏳ جاري الحفظ...' : (quizId ? '💾 حفظ التعديلات' : '💾 حفظ ونشر الاختبار')}
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
