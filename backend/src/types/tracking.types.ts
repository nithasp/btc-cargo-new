import { NamedRef } from './common.types';

export const BOX_TYPES = ['no', 'normal', 'solid'] as const;

export type BoxType = (typeof BOX_TYPES)[number];

export interface ChinaTracking {
  id: number;
  partner_id: string;
  delivery_type: number;
  shopping_serial: string;
  qc: boolean;
  required_picture: boolean;
  is_ready: boolean;
  lot_id: number | null;
  delivery_address: null;
  shipping_with_box: BoxType;
  remarks: string;
}

export interface NewTracking {
  shoppingSerial: string;
  deliveryTypeId: number;
  shippingWithBox: BoxType;
  qc: boolean;
  requiredPicture: boolean;
  remarks: string;
}

export interface TrackingUpdate {
  id: number;
  deliveryTypeId?: number | undefined;
  shippingWithBox?: BoxType | undefined;
  qc?: boolean | undefined;
  requiredPicture?: boolean | undefined;
  remarks?: string | undefined;
}

export interface LotRow {
  id: number;
  user_id: number;
  serial_number: string;
  shopping_serial: string;
  shipping_lot: string | null;
  shipping_lot_sequence: number | null;
  po_number: string | null;
  packing_type: BoxType;
  product_type_id: number | null;
  quantity: number;
  weight: number;
  width: number;
  depth: number;
  height: number;
  volume: number;
  total_weight: number;
  total_volume: number;
  delivery_cost: number;
  packing_cost: number;
  qc_cost: number;
  extra_cost: number;
  other_cost: number;
  th_other_cost: number;
  storage_cost: number;
  total_cost: number;
  counting_note: string;
  remarks: string;
  note: string;
  product_image: string | null;
  current_location_id: number;
  location_name: string;
  cn_checkin: string | null;
  cn_checkout: string | null;
  th_expected_checkin: string | null;
  th_checkin: string | null;
  th_checkout: string | null;
  confirm_state: 'none' | 'pending' | 'submitted';
  sale_order_id: number | null;
}

export interface LotChild {
  id: number;
  weight: number;
  height: number;
  width: number;
  depth: number;
  volume: number;
  weight_per_item: number;
  product_type: number | null;
}

export interface ShippingLotDisplay {
  name: string;
  shipping_lot_sequence: number | null;
}

export interface DeliveryDates {
  cn_checkin: string | null;
  cn_checkout: string | null;
  th_expected_checkin: string | null;
  th_checkin: string | null;
  th_checkout: string | null;
}

export interface Lot {
  id: number;
  lot_id: number;
  serial_number: string;
  shopping_serial: string;
  shipping_lot: string | null;
  shipping_lot_display: ShippingLotDisplay | null;
  po_number: string | null;
  packing_type: BoxType;
  quantity: number;
  total_amount: number;
  weight: number;
  width: number;
  depth: number;
  height: number;
  volume: number;
  total_weight: number;
  total_volume: number;
  delivery_cost: number;
  packing_cost: number;
  qc_cost: number;
  extra_cost: number;
  other_cost: number;
  th_other_cost: number;
  storage_cost: number;
  total_cost: number;
  counting_note: string;
  remarks: string;
  current_location: NamedRef;
  delivery_date: DeliveryDates;
  child_ids: LotChild[];
  po_image_ids: string[];
  image_ids: string[];
  qc_image_ids: string[];
}

export interface TrackingDetail {
  china_tracking: ChinaTracking;
  lot: Lot | null;
}

export interface TrackingWithLot {
  tracking: ChinaTracking;
  lot: LotRow | null;
}

export interface ToConfirmRecord extends Omit<
  Lot,
  'po_image_ids' | 'image_ids' | 'qc_image_ids' | 'child_ids'
> {
  parent_id: null;
  weight_per_item: number;
  shopping_serial_original: string;
  shopping_serial_max_sequence: number;
  prefer_price: string;
  price: number;
  cost_price: number;
  selling_price: number;
  selling_price_unit: number;
  base_cost: number;
  base_profit: number;
  affiliate_cost: number;
  affiliate_profit: number;
  affiliate_commission: number;
  po_image_ids: { url: string }[];
  product_image_ids: { url: string }[];
  normal_image_ids: { url: string }[];
  qc_image_ids: { url: string }[];
  product_image: string | null;
  note: string;
}
