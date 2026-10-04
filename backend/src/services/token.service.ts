import jwt from 'jsonwebtoken';
import { config } from '../config';
import { withTransaction } from '../database';
import { logger } from '../logger';
import {
  AccessTokenPayload,
  AuthSession,
  ExpiresIn,
  ReportTokenPayload,
  TokenPair,
} from '../types/auth.types';
import { TokenServiceDeps } from '../types/service.types';
import { AuthUser, USER_ROLES, UserRole } from '../types/user.types';
import { AppError } from '../utils/errors';

// Pinned when signing and when verifying, so a token can't pick the algorithm it is checked with
const JWT_ALGORITHM: jwt.Algorithm = 'HS256';
const INVALID_REFRESH_TOKEN = 'Invalid or expired refresh token';

// Each kind of token carries its own audience and is only accepted where that audience is
// expected; without it a report link, which is handed to an iframe, would also pass as a login
const ACCESS_AUDIENCE = 'btc-cargo:access';
const REPORT_AUDIENCE = 'btc-cargo:report';
const REPORT_TOKEN_EXPIRY = '1h';

// A replay this soon after the token's own rotation is renewed; past the window a second use is
// taken as a copied token and the whole session is revoked (OWASP API2)
const REUSE_GRACE_MS = 10_000;

export function signAccessToken(user: Pick<AuthUser, 'id' | 'role'>): string {
  return jwt.sign({ userId: user.id, role: user.role }, config.tokenSecret, {
    algorithm: JWT_ALGORITHM,
    audience: ACCESS_AUDIENCE,
    expiresIn: config.accessTokenExpiry as ExpiresIn,
  });
}

export function verifyAccessToken(token: string): { userId: number; role: UserRole } {
  const decoded = jwt.verify(token, config.tokenSecret, {
    algorithms: [JWT_ALGORITHM],
    audience: ACCESS_AUDIENCE,
  }) as AccessTokenPayload;
  if (typeof decoded.userId !== 'number') throw new jwt.JsonWebTokenError('token has no numeric userId');
  const role = USER_ROLES.includes(decoded.role as UserRole) ? (decoded.role as UserRole) : 'customer';
  return { userId: decoded.userId, role };
}

export function signReportToken(userId: number, report: string): string {
  return jwt.sign({ userId, report }, config.tokenSecret, {
    algorithm: JWT_ALGORITHM,
    audience: REPORT_AUDIENCE,
    expiresIn: REPORT_TOKEN_EXPIRY,
  });
}

export function verifyReportToken(token: string): ReportTokenPayload {
  const decoded = jwt.verify(token, config.tokenSecret, {
    algorithms: [JWT_ALGORITHM],
    audience: REPORT_AUDIENCE,
  }) as Partial<ReportTokenPayload>;
  if (typeof decoded.userId !== 'number' || typeof decoded.report !== 'string') {
    throw new jwt.JsonWebTokenError('token is not a report token');
  }
  return { userId: decoded.userId, report: decoded.report };
}

function issue(user: AuthUser, refreshToken: string): AuthSession {
  return { user, accessToken: signAccessToken(user), refreshToken };
}

export function createTokenService({ refreshTokens, users }: TokenServiceDeps) {
  return {
    async issueSession(user: AuthUser): Promise<TokenPair> {
      const refreshToken = await refreshTokens.create(user.id, config.refreshTokenExpiryMs);
      refreshTokens
        .deleteExpired()
        .catch((err: unknown) => logger.warn({ err }, 'could not clear expired tokens'));
      return { accessToken: signAccessToken(user), refreshToken };
    },

    async rotateRefreshToken(token: string): Promise<AuthSession> {
      const rotated = await withTransaction(async (tx) => {
        const consumed = await refreshTokens.consume(token, tx);
        if (!consumed) return null;

        const user = await users.findAuthById(consumed.userId, tx);
        if (!user) throw new AppError(INVALID_REFRESH_TOKEN, 401, 'token_invalid');

        const refreshToken = await refreshTokens.create(
          user.id,
          config.refreshTokenExpiryMs,
          consumed.familyId,
          tx,
        );
        return issue(user, refreshToken);
      });
      if (rotated) return rotated;

      // A revoked family is deleted outright, so a row here means the session is still live
      const reused = await refreshTokens.findUsed(token);
      if (!reused) throw new AppError(INVALID_REFRESH_TOKEN, 401, 'token_invalid');

      const now = Date.now();
      const withinGrace = reused.usedAt !== null && now - reused.usedAt.getTime() <= REUSE_GRACE_MS;

      if (withinGrace && reused.expiresAt.getTime() > now) {
        const renewed = await withTransaction(async (tx) => {
          const user = await users.findAuthById(reused.userId, tx);
          if (!user) return null;

          const refreshToken = await refreshTokens.create(
            user.id,
            config.refreshTokenExpiryMs,
            reused.familyId,
            tx,
          );
          return issue(user, refreshToken);
        });
        if (renewed) return renewed;
      }

      await refreshTokens.deleteFamily(reused.familyId);
      logger.warn(
        { event: 'auth.refresh_token_reuse', userId: reused.userId },
        'refresh token reuse detected',
      );
      throw new AppError(INVALID_REFRESH_TOKEN, 401, 'token_invalid');
    },

    async revokeSession(refreshToken: string): Promise<number | null> {
      return refreshTokens.deleteFamilyOf(refreshToken);
    },

    async revokeAllSessions(userId: number): Promise<void> {
      await refreshTokens.deleteAllForUser(userId);
    },
  };
}

export type TokenService = ReturnType<typeof createTokenService>;
