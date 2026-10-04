import { z } from 'zod';

const REQUIRED = 'This field is required.';
const BLANK = 'This field may not be blank.';

const text = (max: number) =>
  z.string(REQUIRED).trim().min(1, BLANK).max(max, `Ensure this field has no more than ${max} characters.`);

const looseText = (max: number) =>
  z
    .union([z.string().trim().max(max, `Ensure this field has no more than ${max} characters.`), z.null()])
    .transform((value) => value ?? '');

const addressShape = {
  name: text(255),
  person: text(255),
  telephone: looseText(50),
  is_juristic: z
    .union([z.boolean('Must be a valid boolean.'), z.null()])
    .transform((value) => value ?? false),
  vat: looseText(50),
  address: text(2000),
  district: z.string(REQUIRED).regex(/^\d{6}$/, 'Enter a valid district code.'),
};

export const newAddressSchema = z.object({
  ...addressShape,
  telephone: addressShape.telephone.default(''),
  is_juristic: addressShape.is_juristic.default(false),
  vat: addressShape.vat.default(''),
});

export const addressUpdateSchema = z.object(addressShape).partial();

export type NewAddressInput = z.infer<typeof newAddressSchema>;
export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;
