import { ErrorCode, FieldErrors } from '../types/error.types';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: ErrorCode = 'bad_request',
    public fields?: FieldErrors,
  ) {
    super(message);
  }
}

export const fieldError = (fields: FieldErrors): AppError =>
  new AppError('Invalid input', 400, 'invalid_request', fields);

export const notFound = (what: string): AppError => new AppError(`${what} not found`, 404, 'not_found');
