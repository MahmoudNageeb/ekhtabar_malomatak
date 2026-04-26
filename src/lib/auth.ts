import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { connectDB } from './mongodb';
import { User } from '@/models/User';

const SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthUser {
  id: string;
  name: string;
  isAdmin: boolean;
  stage?: string | null;
  grade?: string | null;
}

export function signToken(payload: AuthUser) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  await connectDB();
  const user = await User.findById(decoded.id).lean();
  if (!user) return null;
  return {
    id: String(user._id),
    name: user.name,
    isAdmin: user.isAdmin,
    stage: user.stage,
    grade: user.grade
  };
}
