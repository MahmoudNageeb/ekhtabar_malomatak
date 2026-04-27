import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuizResult extends Document {
  userId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  score: number;            // عدد الإجابات الصحيحة
  totalQuestions: number;
  earnedPoints: number;     // 🆕 النقاط المحققة
  totalPoints: number;      // 🆕 إجمالي النقاط الممكنة
  percentage: number;
  passed: boolean;          // 🆕 هل نجح؟
  passingScore: number;     // 🆕 نسبة النجاح المطلوبة
  answers: any[];
  createdAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  earnedPoints: { type: Number, default: 0 },     // 🆕
  totalPoints: { type: Number, default: 0 },      // 🆕
  percentage: { type: Number, required: true },
  passed: { type: Boolean, default: false },      // 🆕
  passingScore: { type: Number, default: 50 },    // 🆕
  answers: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

QuizResultSchema.index({ userId: 1, quizId: 1 });
QuizResultSchema.index({ createdAt: -1 });

export const QuizResult: Model<IQuizResult> =
  mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
