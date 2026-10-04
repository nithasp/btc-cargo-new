import { ZodError, ZodType } from 'zod';
import { FieldErrors } from '../types/error.types';
import { AppError, fieldError } from './errors';

function formatPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((acc, segment) => {
    if (typeof segment === 'number') return `${acc}[${segment}]`;
    return acc ? `${acc}.${String(segment)}` : String(segment);
  }, '');
}

export function firstProblem(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return 'is not valid';
  const field = formatPath(issue.path);
  return field ? `${field} ${issue.message}` : issue.message;
}

export function parse<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new AppError(firstProblem(result.error), 400, 'invalid_request');
  return result.data;
}

export function toFieldErrors(error: ZodError): FieldErrors {
  const fields: FieldErrors = {};

  for (const issue of error.issues) {
    const path = issue.path.length ? issue.path.map(String) : ['non_field_errors'];
    let node = fields;

    path.forEach((segment, index) => {
      const current = node[segment];
      if (index === path.length - 1) {
        if (Array.isArray(current)) {
          if (!current.includes(issue.message)) current.push(issue.message);
        } else node[segment] = [issue.message];
        return;
      }
      if (!current || Array.isArray(current)) node[segment] = {};
      node = node[segment] as FieldErrors;
    });
  }
  return fields;
}

export function parseFields<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw fieldError(toFieldErrors(result.error));
  return result.data;
}
