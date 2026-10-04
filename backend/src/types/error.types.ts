export type ErrorCode =
  | 'bad_request'
  | 'invalid_request'
  | 'no_token'
  | 'token_expired'
  | 'token_invalid'
  | 'invalid_credentials'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'not_configured'
  | 'internal_error';

export type FieldErrors = { [field: string]: string[] | FieldErrors };

export interface HandledError {
  statusCode: number;
  message: string;
  code: ErrorCode;
  fields?: FieldErrors;
}
