import { z } from 'zod';
import { districtCode, freeText, positiveInt, requiredText } from './common.schema';

const MAX_PARCELS = 100;

const addressShape = {
  name: requiredText(255),
  phone_number: freeText(50),
  line1: requiredText(2000),
  line2: districtCode,
};

export const quotationSchema = z.object({
  carrier_id: positiveInt,
  local_delivery_id: z.union([positiveInt, z.null()]).optional(),
  delivery_address: z.object(addressShape, 'is required'),
  invoice_address: z.object(
    {
      ...addressShape,
      vat: freeText(50),
      is_juristic: z
        .union([z.boolean('must be true or false'), z.null()])
        .optional()
        .transform((value) => value ?? false),
    },
    'is required',
  ),
  china_tracking_ids: z
    .array(positiveInt, 'must be a list')
    .min(1, 'must contain at least one parcel')
    .max(MAX_PARCELS, `must contain at most ${MAX_PARCELS} parcels`),
});

export type QuotationInput = z.infer<typeof quotationSchema>;
