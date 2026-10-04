import { z } from 'zod';
import { boolish, positiveInt, requiredText } from './common.schema';

export const walletQuerySchema = z.object({ active: boolish.optional() });

export const newWalletSchema = z.object({ name: requiredText(100) });

export const walletUpdateSchema = z.object({
  wallet_id: positiveInt,
  name: requiredText(100).optional(),
  active: z.boolean('must be true or false').optional(),
});

export type WalletUpdateInput = z.infer<typeof walletUpdateSchema>;
