import { NextFunction, Request, Response } from 'express';
import { config } from '../config';
import { verifyAccessToken } from '../services/token.service';
import { sendError } from '../utils/response';

// The Angular client sends "Token <key>" as it did with the old API; "Bearer" is accepted too
const SCHEMES = new Set(['token', 'bearer']);

function authenticate(req: Request, res: Response, authHeader: string): boolean {
  const [scheme, token] = authHeader.split(' ');
  if (!scheme || !SCHEMES.has(scheme.toLowerCase()) || !token) {
    sendError(res, 401, 'Invalid token.', 'token_invalid');
    return false;
  }

  try {
    req.user = verifyAccessToken(token);
    return true;
  } catch (err) {
    const name = (err as { name?: string }).name;
    if (name === 'TokenExpiredError') {
      sendError(res, 401, 'Access token has expired.', 'token_expired');
    } else {
      sendError(res, 401, 'Invalid token.', 'token_invalid');
    }
    return false;
  }
}

export const verifyAuthToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    sendError(res, 401, 'Authentication credentials were not provided.', 'no_token');
    return;
  }
  if (authenticate(req, res, authHeader)) next();
};

export const optionalAuthToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authenticate(req, res, authHeader)) next();
};

// The refresh and logout routes are authenticated by a cookie alone, so a page on another site
// could otherwise trigger them in a visitor's browser; a browser always states the calling origin
// on such requests, and anything not on the allow-list is refused (CSRF)
export const trustedOrigin = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  if (origin && !config.allowedOrigins.includes(origin)) {
    sendError(res, 403, 'This origin is not allowed.', 'forbidden');
    return;
  }
  next();
};
