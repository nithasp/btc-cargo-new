import { z } from 'zod';
import { isRealDate } from './common.schema';

const WRONG_DATE = 'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.';

const nullableText = (max: number) =>
  z
    .union([z.string().trim().max(max, `Ensure this field has no more than ${max} characters.`), z.null()])
    .transform((value) => (value === '' ? null : value));

const birthDate = z.union([
  z
    .string(WRONG_DATE)
    .regex(/^\d{4}-\d{2}-\d{2}$/, WRONG_DATE)
    .refine(isRealDate, WRONG_DATE),
  z.null(),
]);

const addressId = z.union([z.number().int().positive('A valid integer is required.'), z.null()]);

// Read-only fields (username, email, is_staff, referralCode, line_notify, socials) are simply not
// listed, so a profile update that echoes the whole user object back can never change them (OWASP API3)
export const userUpdateSchema = z.object({
  first_name: z.string().trim().max(150, 'Ensure this field has no more than 150 characters.').optional(),
  last_name: z.string().trim().max(150, 'Ensure this field has no more than 150 characters.').optional(),
  extendeduser: z
    .object({
      gender: nullableText(20).optional(),
      telephone: nullableText(50).optional(),
      line: nullableText(100).optional(),
      facebook: nullableText(100).optional(),
      google: nullableText(100).optional(),
      affiliateName: nullableText(150).optional(),
      birthDate: birthDate.optional(),
      billingAddressId: addressId.optional(),
      shippingAddressId: addressId.optional(),
      has_consent: z.boolean('Must be a valid boolean.').optional(),
    })
    .optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
