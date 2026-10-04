import { z } from 'zod';
import { PRICE_KEYS } from '../types/affiliate.types';
import { amount, asNumber, districtCode, freeText, positiveInt, requiredText } from './common.schema';

const MAX_RATE = 1_000_000;

const price = z.preprocess(
  asNumber,
  z.number('is required').min(0, 'must be 0 or more').max(MAX_RATE, `must be at most ${MAX_RATE}`),
);

const priceMap = z.object(
  Object.fromEntries(PRICE_KEYS.map((key) => [key, price])) as Record<
    (typeof PRICE_KEYS)[number],
    typeof price
  >,
  'is required',
);

export const memberSchema = z.object({
  id: z.union([positiveInt, z.null()]).optional(),
  affiliate_code: requiredText(50),
  name: requiredText(255),
  email: z.email('email is not valid'),
  commission_type: z.string().trim().max(20, 'must be at most 20 characters').default('cost'),
  referral_code: freeText(50),
  commission_rate: z.preprocess(asNumber, z.number('must be a number').min(0).max(100)).default(0),
  btc_code: freeText(50),
  vat: freeText(50),
  selling_id: z.object({ weight_price: priceMap, volume_price: priceMap }, 'is required'),
  affiliate_address: z.object(
    { phone_number: requiredText(50), line1: requiredText(2000), line2: districtCode },
    'is required',
  ),
});

export const affiliateVerificationSchema = z.object({
  upload_url: requiredText(1000),
  consent_url: requiredText(1000),
});

export const partnerVerificationSchema = z.object({ upload_url: requiredText(1000) });

export const discountSchema = z.object({
  sale_order_id: positiveInt,
  discount_amount: amount(),
});

export type MemberInput = z.infer<typeof memberSchema>;
