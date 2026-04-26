import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  password: string;
  stage?: string;
  grade?: string;
  isAdmin: boolean;
  totalPoints: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  stage: { type: String, default: null },
  grade: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  totalPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.index({ name: 1 });
UserSchema.index({ totalPoints: -1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
