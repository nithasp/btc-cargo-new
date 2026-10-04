import { z } from 'zod';

const MAX_SHOPS = 100;

export const cartSchema = z.object({
  json: z
    .array(z.record(z.string(), z.unknown()), 'Expected a list of shops.')
    .max(MAX_SHOPS, `Ensure this field has no more than ${MAX_SHOPS} shops.`),
});

export type CartInput = z.infer<typeof cartSchema>;
