import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestion {
  _id?: any;
  questionText: string;
  type: 'mcq' | 'tf';
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  order: number;
}

export interface IQuiz extends Document {
  title: string;
  stage: string;
  grade: string;
  duration: number;
  isActive: boolean;
  questions: IQuestion[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'tf'], default: 'mcq' },
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  correctAnswer: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true, trim: true },
  stage: { type: String, required: true },
  grade: { type: String, required: true },
  duration: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

QuizSchema.index({ grade: 1, stage: 1, isActive: 1 });
QuizSchema.index({ title: 'text' });

export const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
