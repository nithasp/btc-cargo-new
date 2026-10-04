import { Response } from 'express';
import { ErrorCode } from '../types/error.types';

export function sendOk<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
  res.status(statusCode).json({ success: true, message, data });
}

// The frontend reads `detail` on the account routes and `message` on the /api/odoo routes, so
// every error carries both
export function sendError(res: Response, statusCode: number, message: string, code: ErrorCode): void {
  res.status(statusCode).json({ success: false, message, detail: message, data: null, code });
}
