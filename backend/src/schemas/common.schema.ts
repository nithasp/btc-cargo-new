import { z } from 'zod';

export const PAGE_SIZE_DEFAULT = 10;
export const PAGE_SIZE_MAX = 100;
export const MAX_AMOUNT = 99999999.99;

const WHOLE_NUMBER = 'must be a whole number greater than 0';

export const asNumber = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

export const wholeNumber = (min: number, max: number) => {
  const message = `must be a whole number between ${min} and ${max}`;
  return z.preprocess(asNumber, z.number(message).int(message).min(min, message).max(max, message));
};

export const positiveInt = z.preprocess(
  asNumber,
  z.number(WHOLE_NUMBER).int(WHOLE_NUMBER).positive(WHOLE_NUMBER),
);

export const amount = (max = MAX_AMOUNT) =>
  z.preprocess(
    asNumber,
    z.number('must be a number').min(0, 'must be 0 or more').max(max, `must be at most ${max}`),
  );

export const positiveAmount = (max = MAX_AMOUNT) =>
  z.preprocess(
    asNumber,
    z.number('must be a number').positive('must be greater than 0').max(max, `must be at most ${max}`),
  );

export const requiredText = (max: number) =>
  z.string('is required').trim().min(1, 'is required').max(max, `must be at most ${max} characters`);

export const optionalText = (max: number) => requiredText(max).optional();

export const freeText = (max: number) =>
  z
    .union([z.string().trim().max(max, `must be at most ${max} characters`), z.null()])
    .optional()
    .transform((value) => value ?? '');

export const isRealDate = (value: string): boolean => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

export const districtCode = z.string('is required').regex(/^\d{6}$/, 'must be a 6-digit district code');

export const boolish = z.preprocess(
  (value) => (value === 'true' ? true : value === 'false' ? false : value),
  z.boolean('must be true or false'),
);

export const idParams = z.object({ id: positiveInt });

// Bounded page size so a single list request can't pull the whole table (OWASP API4)
export const pageSchema = z
  .object({
    page: wholeNumber(1, 100000).default(1),
    pageSize: wholeNumber(1, PAGE_SIZE_MAX).default(PAGE_SIZE_DEFAULT),
  })
  .transform(({ page, pageSize }) => ({ page, pageSize, limit: pageSize, offset: (page - 1) * pageSize }));
