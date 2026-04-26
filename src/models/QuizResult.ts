import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuizResult extends Document {
  userId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: any[];
  createdAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number, required: true },
  answers: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

QuizResultSchema.index({ userId: 1, quizId: 1 });
QuizResultSchema.index({ createdAt: -1 });

export const QuizResult: Model<IQuizResult> =
  mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
