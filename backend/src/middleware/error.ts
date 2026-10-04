import { NextFunction, Request, Response } from 'express';
import { EMAIL_TAKEN, USERNAME_TAKEN } from '../schemas/auth.schema';
import { PostgresError } from '../types/database.types';
import { ErrorCode, HandledError } from '../types/error.types';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

const UNIQUE_MESSAGES: Record<string, string> = {
  china_trackings_serial_key: 'That tracking number is already registered',
  wallets_user_name_active_key: 'A wallet with that name already exists',
  affiliate_members_code_key: 'That affiliate code is already in use',
};

function fromPostgres(err: PostgresError): HandledError | null {
  switch (err.code) {
    case '23505': {
      if (err.constraint === 'users_username_lower_key') {
        return {
          statusCode: 400,
          code: 'conflict',
          message: USERNAME_TAKEN,
          fields: { username: [USERNAME_TAKEN] },
        };
      }
      if (err.constraint === 'users_email_lower_key') {
        return { statusCode: 400, code: 'conflict', message: EMAIL_TAKEN, fields: { email: [EMAIL_TAKEN] } };
      }
      return {
        statusCode: 409,
        code: 'conflict',
        message: UNIQUE_MESSAGES[err.constraint ?? ''] ?? 'A record with that value already exists',
      };
    }
    case '23503':
      return err.detail?.includes('is still referenced')
        ? {
            statusCode: 409,
            code: 'conflict',
            message: 'This record is used elsewhere and cannot be deleted',
          }
        : { statusCode: 400, code: 'invalid_request', message: 'A referenced record does not exist' };
    case '23514':
      return { statusCode: 400, code: 'invalid_request', message: 'A value is not allowed here' };
    case '22001':
      return { statusCode: 400, code: 'invalid_request', message: 'A value is too long' };
    case '22003':
      return { statusCode: 400, code: 'invalid_request', message: 'A number is out of range' };
    case '22P02':
      return { statusCode: 400, code: 'invalid_request', message: 'A value has an invalid format' };
    case '40001':
    case '40P01':
      return {
        statusCode: 409,
        code: 'conflict',
        message: 'The request collided with another one, please try again',
      };
    default:
      return null;
  }
}

function fromUpload(err: { name?: string; code?: string }): HandledError | null {
  if (err.name !== 'MulterError') return null;
  return err.code === 'LIMIT_FILE_SIZE'
    ? { statusCode: 413, code: 'invalid_request', message: 'The file is too large' }
    : { statusCode: 400, code: 'invalid_request', message: 'The upload is not valid' };
}

export const notFoundMiddleware = (req: Request, res: Response): void => {
  sendError(res, 404, `Route ${req.method} ${req.path} not found`, 'not_found');
};

// Unexpected errors (database failures, bugs) are logged server-side and never echoed to the client,
// so stack traces, SQL and internal paths don't leak (OWASP API8). Only an AppError, which this API
// raises on purpose, may carry its own message with a 5xx status.
export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  const known = err as AppError & { status?: number; type?: string };
  const handled = fromPostgres(err as PostgresError) ?? fromUpload(err as { name?: string; code?: string });
  const statusCode = handled?.statusCode ?? known.statusCode ?? known.status ?? 500;

  if (statusCode >= 500 && !(err instanceof AppError)) {
    req.log.error({ err }, 'request failed');
    sendError(res, statusCode, 'Internal Server Error', 'internal_error');
    return;
  }

  const fields = handled?.fields ?? known.fields;
  if (fields) {
    res.status(statusCode).json(fields);
    return;
  }

  if (handled) {
    sendError(res, handled.statusCode, handled.message, handled.code);
    return;
  }

  const bodyParserMessage =
    known.type === 'entity.parse.failed'
      ? 'Request body must be valid JSON'
      : known.type === 'entity.too.large'
        ? 'Request body is too large'
        : null;

  sendError(
    res,
    statusCode,
    bodyParserMessage ?? (err.message || 'Request failed'),
    bodyParserMessage ? 'invalid_request' : ((known.code as ErrorCode | undefined) ?? 'bad_request'),
  );
};
