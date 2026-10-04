import { Request, Response } from 'express';
import { config } from '../config';
import { INVALID_LOGIN, loginSchema, registrationSchema, socialLoginSchema } from '../schemas/auth.schema';
import { socialService, tokenService, userService } from '../services';
import { SocialProvider } from '../types/social.types';
import { AuthUser } from '../types/user.types';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError, fieldError } from '../utils/errors';
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from '../utils/refreshCookie';
import { currentUserId } from '../utils/request';
import { parseFields } from '../utils/validation';

// The Angular client reads the access token from `key` and sends it back as "Token <key>".
// The refresh token never reaches JavaScript: it travels only in the HttpOnly cookie.
async function startSession(res: Response, user: AuthUser, statusCode = 200): Promise<void> {
  const { accessToken, refreshToken } = await tokenService.issueSession(user);
  setRefreshCookie(res, refreshToken);
  res.status(statusCode).json({ key: accessToken });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = parseFields(registrationSchema, req.body);
  const user = await userService.register(input);

  req.log.info({ event: 'user.registered', userId: user.id }, 'account created');
  await startSession(res, user, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = parseFields(loginSchema, req.body);

  const user = await userService.authenticate(input.username.trim(), input.password);
  if (!user) {
    req.log.warn({ event: 'user.login_failed', username: input.username }, 'login failed');
    throw fieldError({ non_field_errors: [INVALID_LOGIN] });
  }

  await startSession(res, user);
});

// Guest entry for visitors: it signs in as the one seeded demo account and nothing else, so it
// hands out no more than that account's own login would. Switched off with DEMO_LOGIN_ENABLED=false.
export const demo = asyncHandler(async (req: Request, res: Response) => {
  const user = config.demo.loginEnabled ? await userService.findByUsername(config.demo.username) : null;
  if (!user || user.role !== 'customer') {
    throw new AppError('Demo access is not available', 404, 'not_found');
  }

  req.log.info({ event: 'user.demo_logged_in', userId: user.id }, 'demo session started');
  await startSession(res, user);
});

export const social = (provider: SocialProvider) =>
  asyncHandler(async (req: Request, res: Response) => {
    const input = parseFields(socialLoginSchema, req.body);
    const user = await socialService.signIn(provider, input, req.user?.userId ?? null);
    await startSession(res, user);
  });

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = readRefreshCookie(req);
  if (!token) throw new AppError('Invalid or expired refresh token', 401, 'token_invalid');

  const { accessToken, refreshToken } = await tokenService.rotateRefreshToken(token);
  setRefreshCookie(res, refreshToken);
  res.json({ key: accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = readRefreshCookie(req);
  if (token) await tokenService.revokeSession(token);

  clearRefreshCookie(res);
  res.json({ detail: 'Successfully logged out.' });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await tokenService.revokeAllSessions(currentUserId(req));
  clearRefreshCookie(res);
  res.json({ detail: 'All sessions revoked.' });
});
