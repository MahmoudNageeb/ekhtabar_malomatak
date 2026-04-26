import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISummary extends Document {
  title: string;
  stage: string;
  grade: string;
  type: 'image' | 'youtube' | 'file';
  url: string;
  imageUrl?: string;
  description?: string;
  createdAt: Date;
}

const SummarySchema = new Schema<ISummary>({
  title: { type: String, required: true },
  stage: { type: String, required: true },
  grade: { type: String, required: true },
  type: { type: String, enum: ['image', 'youtube', 'file'], required: true },
  url: { type: String, required: true },
  imageUrl: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

SummarySchema.index({ grade: 1, stage: 1 });

export const Summary: Model<ISummary> =
  mongoose.models.Summary || mongoose.model<ISummary>('Summary', SummarySchema);
