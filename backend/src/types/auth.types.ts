import jwt from 'jsonwebtoken';
import { AuthUser, UserRole } from './user.types';

export type ExpiresIn = NonNullable<jwt.SignOptions['expiresIn']>;

export interface AccessTokenPayload {
  userId: number;
  role?: UserRole | undefined;
}

export interface ReportTokenPayload {
  userId: number;
  report: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession extends TokenPair {
  user: AuthUser;
}

export interface StoredRefreshToken {
  id: number;
  userId: number;
  familyId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}
