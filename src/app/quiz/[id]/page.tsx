'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LOGO_URL, ARABIC_LETTERS } from '@/lib/constants';
import HomeButton from '@/components/HomeButton';

export default function QuizPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const submittingRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user));
    fetch(`/api/quizzes/${params.id}`).then((r) => r.json()).then((d) => {
      setQuiz(d.quiz);
      setLoading(false);
    });
  }, [params.id]);

  // المؤقت
  useEffect(() => {
    if (!started || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, started, submitted]);

  // منع الخروج / الرجوع أثناء الاختبار
  useEffect(() => {
    if (!started || submitted) return;

    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'هل أنت متأكد من الخروج؟ لن يتم حفظ إجاباتك.';
      return e.returnValue;
    };
    const popState = () => {
      if (startedRef.current && !submittingRef.current) {
        if (confirm('سيتم تسليم الاختبار تلقائيًا. هل أنت متأكد من الخروج؟')) {
          handleSubmit(false);
        } else {
          history.pushState(null, '', window.location.href);
        }
      }
    };

    history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('popstate', popState);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', popState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, submitted]);

  function startQuiz() {
    if (!user) {
      if (confirm('يجب تسجيل الدخول لحل الاختبار. هل تريد الذهاب إلى صفحة تسجيل الدخول؟')) {
        router.push('/login');
      }
      return;
    }
    // 🆕 لو حصل على الدرجة النهائية قبل كذا — ممنوع الإعادة
    if (quiz?.isPerfect) {
      alert('لقد حصلت بالفعل على الدرجة النهائية في هذا الاختبار 🎉 لا يمكن إعادته مرة أخرى.');
      return;
    }
    setStarted(true);
    startedRef.current = true;
    setTimeLeft((quiz?.duration || 10) * 60);
  }

  async function handleSubmit(auto = false) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(`/api/quizzes/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
        credentials: 'include'
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        const errMsg = data?.error || `فشل التسليم (HTTP ${res.status})`;
        setSubmitError(errMsg);
        alert(errMsg);
        submittingRef.current = false;
        setSubmitting(false);
        // 🆕 لو كان حاصل على الدرجة النهائية بالفعل — نوجهه لنتيجته
        if (data?.alreadyPerfect) {
          if (data?.resultId) router.push(`/result/${data.resultId}`);
          else router.push('/profile');
        }
        return;
      }

      // ✅ نجح التسليم - اعرض النتيجة
      setResult(data);
      setSubmitted(true);
      setSubmitting(false);
    } catch (err: any) {
      console.error('Submit error:', err);
      const errMsg = 'حدث خطأ في الاتصال. تأكد من اتصال الإنترنت ثم حاول مجددًا.';
      setSubmitError(errMsg);
      alert(errMsg);
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  function selectAnswer(qid: string, val: string) {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-3">
      <div className="spinner"></div>
      <div className="text-gray-500 font-bold">جاري التحميل...</div>
    </div>
  );
  if (!quiz) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <div className="text-6xl">📭</div>
      <p className="text-gray-600 font-extrabold text-xl">الاختبار غير موجود</p>
      <Link href="/" className="btn-royal btn-shine">🏠 العودة للرئيسية</Link>
    </div>
  );

  // ✅ النتيجة بعد التسليم - تكفي وجود result
  if (result) {
    return <ResultsView result={result} quiz={quiz} onRetake={() => location.reload()} />;
  }

  // ⏳ شاشة التسليم الجاري
  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gradient-to-br from-royal-50 to-gold-50 p-4">
        <div className="spinner"></div>
        <div className="text-royal-700 font-extrabold text-xl">⏳ جاري تسليم الاختبار وحساب النتيجة...</div>
        <div className="text-gray-500 text-sm">من فضلك انتظر قليلًا</div>
      </div>
    );
  }

  // قبل البدء - شاشة المعلومات
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-royal-50 via-white to-gold-50/50"></div>
        <div className="absolute inset-0 pattern-bg"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-royal-300/30 rounded-full blur-3xl floating-shape"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold-300/40 rounded-full blur-3xl floating-shape"></div>

        <HomeButton variant="royal" />

        <div className="relative max-w-2xl mx-auto px-4 py-10 w-full animate-fade-in-up">
          <div className="glass-card rounded-3xl shadow-2xl p-8 text-center border-2 border-gold-200/50">
            <div className="h-28 w-28 sm:h-32 sm:w-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-white via-blue-50 to-amber-50 ring-4 ring-amber-400/80 ring-offset-2 ring-offset-white shadow-[0_15px_50px_rgba(11,74,155,0.35)] animate-float">
              <img src={LOGO_URL} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="inline-block px-3 py-1 bg-gold-100 border-2 border-gold-300 rounded-full text-xs font-extrabold text-gold-700 mb-3">
              📝 اختبار جاهز
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold shimmer-text mb-2">{quiz.title}</h1>

            {/* 🆕 صورة غلاف الاختبار */}
            {quiz.coverImage && (
              <div className="mt-4 rounded-2xl overflow-hidden border-2 border-amber-200 shadow-md aspect-video max-w-md mx-auto">
                <img src={quiz.coverImage} alt={quiz.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoBox icon="❓" label="عدد الأسئلة" value={quiz.questions?.length || 0} />
              <InfoBox icon="⏱️" label="المدة" value={`${quiz.duration} دقيقة`} />
              <InfoBox icon="⭐" label="إجمالي النقاط" value={quiz.totalPoints || quiz.questions?.length || 0} />
              <InfoBox icon="🎯" label="نسبة النجاح" value={`${quiz.passingScore || 50}%`} />
              <InfoBox icon="📚" label="المرحلة" value={quiz.stage === 'primary' ? 'ابتدائي' : 'إعدادي'} />
              <InfoBox icon="🎓" label="الصف" value={quiz.grade || ''} />
            </div>

            {/* 🆕 حالة محاولاتك السابقة */}
            {user && (quiz.myAttempts ?? 0) > 0 && (
              <div
                id="my-attempts-status"
                className={`mt-6 rounded-2xl p-4 text-right border-2 ${
                  quiz.isPerfect
                    ? 'bg-gradient-to-l from-emerald-50 to-teal-50 border-emerald-300'
                    : 'bg-gradient-to-l from-royal-50 to-blue-50 border-royal-300'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{quiz.isPerfect ? '🎉' : '📊'}</span>
                  <span className={`font-extrabold ${quiz.isPerfect ? 'text-emerald-800' : 'text-royal-800'}`}>
                    {quiz.isPerfect
                      ? 'حصلت على الدرجة النهائية في هذا الاختبار!'
                      : `أعلى نتيجة لك: ${quiz.myBestPercentage}%`}
                  </span>
                  <span className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200 font-bold text-gray-600">
                    عدد المحاولات: {quiz.myAttempts}
                  </span>
                </div>
                <p className={`mt-2 text-sm font-semibold ${quiz.isPerfect ? 'text-emerald-700' : 'text-royal-700'}`}>
                  {quiz.isPerfect
                    ? 'لا يمكن إعادة الاختبار بعد الحصول على الدرجة الكاملة ✅'
                    : 'يمكنك إعادة المحاولة بحرية، وسيتم احتساب أعلى درجة فقط في نقاطك.'}
                </p>
                {quiz.myBestResultId && (
                  <Link
                    href={`/result/${quiz.myBestResultId}`}
                    className="inline-block mt-3 text-xs font-extrabold text-royal-700 bg-white px-3 py-1.5 rounded-xl border-2 border-royal-200 hover:border-gold-400 transition-colors"
                  >
                    📄 عرض أفضل نتيجة لك ←
                  </Link>
                )}
              </div>
            )}

            <div className="mt-6 bg-gradient-to-l from-gold-50 to-amber-50 border-2 border-gold-300 rounded-2xl p-4 text-right text-sm">
              <p className="font-extrabold text-gold-800 mb-2 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>تنبيهات هامة قبل البدء:</span>
              </p>
              <ul className="text-gold-800 space-y-1.5 list-disc pr-5 font-semibold">
                <li>عند بدء الاختبار لن تستطيع الرجوع أو الخروج إلا بعد التسليم.</li>
                <li>عند انتهاء الوقت يتم تسليم الاختبار تلقائيًا.</li>
                <li>كل الأسئلة تظهر في صفحة واحدة بدون زر "التالي".</li>
                <li>لو نقصت درجاتك يمكنك الإعادة أكثر من مرة بحرية، وتُحتسب أعلى درجة فقط في نقاطك.</li>
                <li className="text-emerald-800">لو حصلت على الدرجة النهائية (100%) لن تستطيع إعادة الاختبار مرة أخرى.</li>
              </ul>
            </div>

            {quiz.isPerfect ? (
              <div className="mt-6 space-y-3">
                <div className="w-full py-4 bg-gradient-to-l from-emerald-600 to-teal-600 text-white rounded-2xl font-extrabold text-lg shadow-xl text-center">
                  🏆 أنت حاصل على الدرجة النهائية — الاختبار مكتمل
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/profile" className="px-5 py-3 bg-white border-2 border-royal-300 text-royal-700 rounded-2xl font-extrabold hover:border-gold-400 transition-colors">
                    👤 صفحتي الشخصية
                  </Link>
                  <Link href="/" className="px-5 py-3 bg-white border-2 border-gold-300 text-gold-700 rounded-2xl font-extrabold hover:border-royal-400 transition-colors">
                    🏠 الرئيسية
                  </Link>
                </div>
              </div>
            ) : (
              <button
                onClick={startQuiz}
                className="mt-6 w-full py-4 bg-gradient-to-l from-royal-700 to-royal-600 hover:from-gold-500 hover:to-gold-600 text-white rounded-2xl font-extrabold text-lg shadow-xl shadow-royal-700/30 hover:shadow-2xl hover:shadow-gold-500/40 btn-shine transition-all hover:scale-[1.02] pulse-glow"
              >
                {(quiz.myAttempts ?? 0) > 0 ? '🔄 إعادة المحاولة الآن' : '🚀 ابدأ التحدي الآن'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // أثناء الحل
  return (
    <div className="min-h-screen exam-mode no-select">
      {/* الهيدر الثابت */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b-4 border-gold-500">
        <div className="h-1 bg-gradient-to-r from-royal-700 via-gold-500 to-royal-700"></div>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-white to-blue-50 ring-2 ring-amber-400 shadow-md flex-shrink-0">
            <img src={LOGO_URL} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-base sm:text-lg royal-text truncate">{quiz.title}</h1>
            <p className="text-xs text-gray-500 font-semibold">📝 {quiz.questions?.length} سؤال • أجب بدقة</p>
          </div>
          {/* المؤقت */}
          <div className={`px-4 py-2.5 rounded-2xl font-extrabold text-lg shadow-lg border-2 ${timeLeft < 60 ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' : timeLeft < 180 ? 'bg-gold-100 text-gold-700 border-gold-300' : 'bg-royal-100 text-royal-700 border-royal-300'}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* الأسئلة بشكل طولي */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {quiz.questions.map((q: any, idx: number) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={idx}
            value={answers[q.id]}
            onChange={(v) => selectAnswer(q.id, v)}
          />
        ))}

        {/* رسالة خطأ التسليم (إن وجدت) */}
        {submitError && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 rounded-2xl p-4 font-bold text-center">
            ⚠️ {submitError}
          </div>
        )}

        {/* زر التسليم */}
        <div className="sticky bottom-4 z-30">
          <button
            onClick={() => {
              if (submitting) return;
              if (confirm('هل أنت متأكد من تسليم الاختبار؟')) handleSubmit(false);
            }}
            disabled={submitting}
            className={`w-full py-4 ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-l from-emerald-500 via-emerald-600 to-teal-600 hover:from-gold-500 hover:to-gold-600'} text-white rounded-2xl font-extrabold text-xl shadow-2xl btn-shine transition-all border-2 border-white`}
          >
            {submitting ? '⏳ جاري التسليم...' : '✅ تسليم الاختبار'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }: any) {
  return (
    <div className="bg-gradient-to-br from-royal-50 to-gold-50/50 border-2 border-royal-200 rounded-2xl p-3 hover:border-gold-400 transition-colors">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-500 font-semibold">{label}</div>
      <div className="text-sm font-extrabold royal-text mt-0.5">{value}</div>
    </div>
  );
}

function QuestionCard({ question, index, value, onChange }: any) {
  const isMcq = question.type === 'mcq';
  const options = isMcq
    ? [
        { key: 'A', label: question.optionA },
        { key: 'B', label: question.optionB },
        { key: 'C', label: question.optionC },
        ...(question.optionD ? [{ key: 'D', label: question.optionD }] : [])
      ]
    : [
        { key: 'true', label: 'صح ✓' },
        { key: 'false', label: 'خطأ ✗' }
      ];

  return (
    <div className="question-card bg-white rounded-3xl shadow-lg p-5 sm:p-6 border-2 border-royal-100 hover:border-gold-300 transition-all" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-11 h-11 bg-gradient-to-br from-royal-700 to-royal-500 text-white rounded-2xl flex items-center justify-center font-extrabold shadow-lg border-2 border-gold-300">
          {index + 1}
        </div>
        <h2 className="flex-1 text-base sm:text-lg font-extrabold text-gray-800 leading-relaxed">
          {question.questionText}
        </h2>
        {/* 🆕 شارة نقاط السؤال */}
        {question.points != null && (
          <div className="flex-shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-xl font-extrabold text-sm shadow-md flex items-center gap-1">
            <span>⭐</span>
            <span>{question.points}</span>
          </div>
        )}
      </div>

      {/* 🆕 صورة السؤال */}
      {question.imageUrl && (
        <div className="mb-4 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md max-h-80 flex items-center justify-center bg-gray-50">
          <img src={question.imageUrl} alt={`سؤال ${index + 1}`} className="max-w-full max-h-80 object-contain" />
        </div>
      )}

      <div className={`grid ${isMcq ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'} gap-3`}>
        {options.map((opt, i) => {
          const selected = value === opt.key;
          const arabicLetter = isMcq ? ARABIC_LETTERS[i] : '';
          return (
            <label
              key={opt.key}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${selected ? 'border-gold-500 bg-gradient-to-l from-gold-50 to-amber-50 shadow-md scale-[1.02]' : 'border-gray-200 bg-gray-50 hover:border-royal-300 hover:bg-royal-50/50'}`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                checked={selected}
                onChange={() => onChange(opt.key)}
                className="hidden"
              />
              {isMcq && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base flex-shrink-0 transition-all ${selected ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-md' : 'bg-white text-royal-700 border-2 border-royal-200'}`}>
                  {arabicLetter}
                </div>
              )}
              <span className={`flex-1 font-bold ${selected ? 'text-gold-800' : 'text-gray-700'}`}>
                {opt.label}
              </span>
              {selected && <span className="text-gold-600 text-lg">✓</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ResultsView({ result, quiz, onRetake }: any) {
  const {
    score = 0,
    total = 0,
    percentage = 0,
    detailed = [],
    earnedPoints = 0,
    totalPoints = 0,
    passingScore,
    passed
  } = result || {};

  let message = '';
  let emoji = '';
  let color = '';
  if (percentage >= 90) { message = 'ممتاز جدًا! أنت متفوق! 🌟'; emoji = '🏆'; color = 'from-yellow-400 to-amber-500'; }
  else if (percentage >= 75) { message = 'رائع! استمر في التميز 🎉'; emoji = '🎯'; color = 'from-emerald-400 to-teal-500'; }
  else if (percentage >= 50) { message = 'جيد! يمكنك تحقيق المزيد 💪'; emoji = '👍'; color = 'from-blue-400 to-indigo-500'; }
  else { message = 'لا تستسلم! حاول مرة أخرى 📚'; emoji = '💡'; color = 'from-orange-400 to-red-500'; }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-royal-50 via-white to-gold-50/50"></div>
      <div className="absolute inset-0 pattern-bg"></div>
      <HomeButton variant="royal" />
      <div className="relative max-w-4xl mx-auto px-4 py-8">

        {/* بطاقة النتيجة */}
        <div className={`bg-gradient-to-br ${color} rounded-3xl shadow-2xl p-8 text-center text-white mb-6 relative overflow-hidden`}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="h-20 w-20 mx-auto mb-3 rounded-full overflow-hidden bg-white/20 ring-4 ring-white/40 shadow-xl backdrop-blur-sm">
              <img src={LOGO_URL} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="text-7xl mb-3 animate-bounce-slow">{emoji}</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">انتهى الاختبار!</h2>
            <p className="text-lg sm:text-xl opacity-95 mb-4">{message}</p>
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-3xl px-8 py-4 border-2 border-white/30">
              <div className="text-5xl sm:text-6xl font-extrabold">{percentage}%</div>
              <div className="text-base sm:text-lg mt-1 opacity-95">{score} من {total} إجابة صحيحة</div>
              {totalPoints != null && totalPoints > 0 && (
                <div className="mt-3 pt-3 border-t border-white/30 flex items-center justify-center gap-2 text-lg font-extrabold">
                  <span className="text-2xl">⭐</span>
                  <span>{earnedPoints} من {totalPoints} نقطة</span>
                </div>
              )}
              {passingScore != null && (
                <div className={`mt-2 inline-block px-4 py-1 rounded-full text-sm font-bold ${passed ? 'bg-emerald-500/40' : 'bg-red-500/40'}`}>
                  {passed ? '✅ ناجح' : '❌ راسب'} (نسبة النجاح {passingScore}%)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🆕 تنبيه عند الحصول على الدرجة النهائية */}
        {percentage >= 100 && (
          <div id="perfect-score-notice" className="mb-6 bg-gradient-to-l from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-5 text-center shadow-lg">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-lg font-extrabold text-emerald-800">
              مبروك! حصلت على الدرجة النهائية
            </div>
            <p className="text-sm text-emerald-700 font-semibold mt-1">
              تم تسجيل كل نقاط هذا الاختبار في رصيدك، ولا يمكن إعادته مرة أخرى.
            </p>
          </div>
        )}

        {/* الأزرار */}
        <div className="flex flex-wrap gap-3 mb-6">
          {percentage < 100 && (
            <button
              onClick={onRetake}
              className="flex-1 min-w-[140px] py-3.5 bg-gradient-to-l from-royal-700 to-royal-600 hover:from-gold-500 hover:to-gold-600 text-white rounded-2xl font-extrabold shadow-lg hover:shadow-2xl btn-shine transition-all"
            >
              🔄 إعادة الاختبار
            </button>
          )}
          <Link
            href="/profile"
            className="flex-1 min-w-[140px] text-center py-3.5 bg-gradient-to-l from-gold-500 to-gold-600 text-white rounded-2xl font-extrabold shadow-lg hover:shadow-2xl btn-shine transition-all"
          >
            📊 سجل نتائجي
          </Link>
          <Link
            href="/"
            className="flex-1 min-w-[140px] text-center py-3.5 bg-white border-2 border-royal-500 text-royal-700 rounded-2xl font-extrabold hover:bg-royal-50 transition"
          >
            🏠 الصفحة الرئيسية
          </Link>
        </div>

        {/* مراجعة الأسئلة */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-xl font-extrabold text-gray-800 mb-4">📝 مراجعة الإجابات</h3>
          <div className="space-y-4">
            {detailed.map((q: any, idx: number) => (
              <ReviewQuestion key={q.questionId} q={q} idx={idx} showPoints />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewQuestion({ q, idx, showPoints }: any) {
  const isMcq = q.type === 'mcq';
  const options = isMcq
    ? [
        { key: 'A', label: q.options.A },
        { key: 'B', label: q.options.B },
        { key: 'C', label: q.options.C },
        ...(q.options.D ? [{ key: 'D', label: q.options.D }] : [])
      ]
    : [
        { key: 'true', label: 'صح ✓' },
        { key: 'false', label: 'خطأ ✗' }
      ];

  return (
    <div className={`rounded-2xl p-4 border-2 ${q.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white shadow-md ${q.isCorrect ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {q.isCorrect ? '✓' : '✗'}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2 flex-wrap">
            <span>السؤال {idx + 1}</span>
            {showPoints && q.points != null && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                ⭐ {q.earnedPoints ?? 0}/{q.points}
              </span>
            )}
          </div>
          <h4 className="font-extrabold text-gray-800">{q.questionText}</h4>
        </div>
      </div>

      {/* صورة السؤال في المراجعة */}
      {q.imageUrl && (
        <div className="mb-3 mr-12 rounded-xl overflow-hidden border-2 border-gray-200 max-h-48 flex items-center justify-center bg-white">
          <img src={q.imageUrl} alt={`سؤال ${idx + 1}`} className="max-w-full max-h-48 object-contain" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mr-12">
        {options.map((opt, i) => {
          const isCorrect = String(opt.key).toLowerCase() === String(q.correctAnswer).toLowerCase();
          const isUserAnswer = String(opt.key).toLowerCase() === String(q.userAnswer).toLowerCase();
          let style = 'bg-white border-gray-200 text-gray-600';
          if (isCorrect) style = 'bg-emerald-100 border-emerald-400 text-emerald-800 font-bold';
          else if (isUserAnswer) style = 'bg-red-100 border-red-400 text-red-800 font-bold';
          return (
            <div key={opt.key} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 ${style}`}>
              {isMcq && (
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${isCorrect ? 'bg-emerald-600 text-white' : isUserAnswer ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  {ARABIC_LETTERS[i]}
                </span>
              )}
              <span className="flex-1 text-sm">{opt.label}</span>
              {isCorrect && <span className="text-emerald-600 font-bold text-xs">✓ الصحيحة</span>}
              {isUserAnswer && !isCorrect && <span className="text-red-600 font-bold text-xs">إجابتك</span>}
            </div>
          );
        })}
      </div>
      {!q.userAnswer && (
        <div className="mt-2 mr-12 text-sm text-orange-600 font-bold">⚠️ لم تجب على هذا السؤال</div>
      )}
    </div>
  );
}
