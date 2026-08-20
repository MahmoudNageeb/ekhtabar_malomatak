import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { QuizResult } from '@/models/QuizResult';
import { Quiz } from '@/models/Quiz';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectDB();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const data = await User.findById(user.id).lean() as any;
  const results = await QuizResult.find({ userId: user.id })
    .populate({ path: 'quizId', model: Quiz, select: 'title grade term' })
    .sort({ createdAt: -1 })
    .lean();

  // 🆕 أعلى محاولة لكل اختبار (هي اللي بتُحسب في نقاط الطالب)
  const bestByQuiz = new Map<string, { points: number; percentage: number; resultId: string }>();
  for (const r of results as any[]) {
    const qid = r.quizId ? String(r.quizId._id ?? r.quizId) : String(r._id);
    const points = r.earnedPoints ?? 0;
    const prev = bestByQuiz.get(qid);
    if (!prev || points > prev.points) {
      bestByQuiz.set(qid, { points, percentage: r.percentage ?? 0, resultId: String(r._id) });
    }
  }

  const bestResultIds = new Set(Array.from(bestByQuiz.values()).map((b) => b.resultId));

  // 🆕 إجمالي النقاط المحسوبة من أعلى محاولة لكل اختبار
  const countedPoints = Array.from(bestByQuiz.values()).reduce((a, b) => a + b.points, 0);
  const perfectCount = (results as any[]).filter((r) => (r.percentage ?? 0) >= 100).length;

  return NextResponse.json({
    user: {
      id: String(data._id),
      name: data.name,
      stage: data.stage,
      grade: data.grade,
      totalPoints: data.totalPoints,
      // 🆕 ملخص الدرجات
      summary: {
        attempts: results.length,
        quizzesTaken: bestByQuiz.size,
        countedPoints,
        perfectCount
      },
      results: (results as any[]).map((r: any) => {
        const qid = r.quizId ? String(r.quizId._id ?? r.quizId) : null;
        return {
          id: String(r._id),
          score: r.score,
          totalQuestions: r.totalQuestions,
          // 🆕 الدرجات بالنقاط
          earnedPoints: r.earnedPoints ?? 0,
          totalPoints: r.totalPoints ?? 0,
          percentage: r.percentage,
          passed: r.passed ?? ((r.percentage ?? 0) >= (r.passingScore ?? 50)),
          passingScore: r.passingScore ?? 50,
          isPerfect: (r.percentage ?? 0) >= 100,
          // 🆕 هل هذه المحاولة هي المحسوبة في النقاط؟
          isCounted: bestResultIds.has(String(r._id)),
          createdAt: r.createdAt,
          quiz: r.quizId ? {
            id: qid,
            title: r.quizId.title,
            grade: r.quizId.grade,
            term: r.quizId.term || 'term-2'
          } : null
        };
      })
    }
  });
}
