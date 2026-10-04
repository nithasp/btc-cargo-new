import { z } from 'zod';
import { REPORT_NAMES } from '../types/report.types';
import { isRealDate } from './common.schema';

const NOT_A_DAY = 'must be a date such as 2026-01-31';

const day = z
  .string(NOT_A_DAY)
  .regex(/^\d{4}-\d{2}-\d{2}$/, NOT_A_DAY)
  .refine(isRealDate, NOT_A_DAY);

export const reportParams = z.object({
  name: z.enum(REPORT_NAMES, { error: 'is not a known report' }),
});

export const embedParams = z.object({ token: z.string().min(1).max(2048) });

export const reportRangeSchema = z.object({
  start_date: day.optional(),
  end_date: day.optional(),
});

export type ReportRangeInput = z.infer<typeof reportRangeSchema>;
