import { z } from 'zod';
import { amount, freeText, optionalText, positiveAmount, positiveInt } from './common.schema';

const MAX_YUAN = 10_000_000;
const MAX_SPLITS = 20;

const bankExchange = z
  .object({
    payment_gateway_type: z.literal('bank'),
    amount: positiveAmount(MAX_YUAN),
    account_type: z.enum(['detail', 'img'], { error: 'must be detail or img' }),
    account_name: optionalText(255),
    account_number: optionalText(100),
    account_url: optionalText(1000),
    description: freeText(1000),
  })
  .refine((body) => body.account_type !== 'detail' || (body.account_name && body.account_number), {
    error: 'account_name and account_number are required',
    path: ['account_name'],
  })
  .refine((body) => body.account_type !== 'img' || body.account_url, {
    error: 'is required',
    path: ['account_url'],
  });

const alipayExchange = z.object({
  payment_gateway_type: z.literal('alipay'),
  alipay_account_id: positiveInt,
  amount_split: z
    .array(
      z.object({
        wallet_id: positiveInt,
        amount: positiveAmount(MAX_YUAN),
        use_credit_amount: amount(MAX_YUAN).default(0),
      }),
      'must be a list',
    )
    .min(1, 'must contain at least one amount')
    .max(MAX_SPLITS, `must contain at most ${MAX_SPLITS} amounts`),
  description: freeText(1000),
});

export const exchangeSchema = z.union([bankExchange, alipayExchange], {
  error: 'payment_gateway_type must be bank or alipay, with its required fields',
});

export const serviceQuerySchema = z.object({
  service: z.enum(['payment', 'delivery'], { error: 'must be payment or delivery' }).optional(),
});

export const paymentSchema = z.object({
  payment_gateway_id: positiveInt,
  amount: positiveAmount(),
  payment_date_time: z.union([z.string().trim().max(40), z.null()]).optional(),
  image_ids: z.unknown().optional(),
});

export type ExchangeInput = z.infer<typeof exchangeSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
