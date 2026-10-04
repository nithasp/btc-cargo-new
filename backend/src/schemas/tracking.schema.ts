import { z } from 'zod';
import { BOX_TYPES } from '../types/tracking.types';
import { boolish, freeText, positiveInt, requiredText } from './common.schema';

const MAX_PARCELS = 50;

const serial = requiredText(100);
const boxType = z.enum(BOX_TYPES, { error: `must be one of: ${BOX_TYPES.join(', ')}` });
const flag = z.boolean('must be true or false');
const parcels = <T extends z.ZodType>(item: T) =>
  z
    .array(item, 'must be a list')
    .min(1, 'must contain at least one parcel')
    .max(MAX_PARCELS, `must contain at most ${MAX_PARCELS} parcels`);

export const registerTrackingSchema = z.object({
  china_tracking_ids: parcels(
    z.object({
      shopping_serial: serial,
      delivery_type_id: positiveInt,
      shipping_with_box: boxType.default('no'),
      qc: flag.default(false),
      required_picture: flag.default(false),
      remark: freeText(1000),
    }),
  ),
});

export const updateTrackingSchema = z.object({
  china_tracking_ids: parcels(
    z.object({
      id: positiveInt,
      delivery_type_id: positiveInt.optional(),
      shipping_with_box: boxType.optional(),
      qc: flag.optional(),
      required_picture: flag.optional(),
      remark: z.union([z.string().trim().max(1000, 'must be at most 1000 characters'), z.null()]).optional(),
    }),
  ),
});

export const checkTrackingSchema = z.object({ serial_list: parcels(serial) });

export const trackingQuerySchema = z.object({ is_ready: boolish.optional() });

export const toConfirmSubmitSchema = z.object({
  lot_id: positiveInt,
  po_image: requiredText(1000),
});

export type RegisterTrackingInput = z.infer<typeof registerTrackingSchema>;
export type UpdateTrackingInput = z.infer<typeof updateTrackingSchema>;
