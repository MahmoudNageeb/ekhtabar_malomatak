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
  points: number; // 🆕 نقاط السؤال (يتحكم بها الأدمن)
  imageUrl?: string; // 🆕 صورة اختيارية للسؤال
}

export interface IQuiz extends Document {
  title: string;
  stage: string;
  grade: string;
  term: string; // 🆕 الفصل الدراسي: term-1 | term-2
  duration: number;
  isActive: boolean;
  questions: IQuestion[];
  passingScore: number; // 🆕 نسبة النجاح (0-100)
  coverImage?: string; // 🆕 صورة غلاف الاختبار
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'tf'], default: 'mcq' },
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  correctAnswer: { type: String, required: true },
  order: { type: Number, default: 0 },
  points: { type: Number, default: 1, min: 0 }, // 🆕
  imageUrl: { type: String, default: null } // 🆕
}, { _id: true });

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true, trim: true },
  stage: { type: String, required: true },
  grade: { type: String, required: true },
  // 🆕 الفصل الدراسي — الافتراضي term-2 للحفاظ على التوافق مع البيانات القديمة
  term: { type: String, enum: ['term-1', 'term-2'], default: 'term-2', index: true },
  duration: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  questions: [QuestionSchema],
  passingScore: { type: Number, default: 50, min: 0, max: 100 }, // 🆕
  coverImage: { type: String, default: null }, // 🆕
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

QuizSchema.index({ grade: 1, stage: 1, term: 1, isActive: 1 });
QuizSchema.index({ title: 'text' });

export const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
