import { Pagination } from "./pagination";

export interface ToConfirmResponse {
  records: ToConfirmRecords[];
  pagination: Pagination;
}

export interface ToConfirmRecords {
  serial_number: string;
  total_cost: number;
  lot_id: number;
  parent_id: number;
  height: number;
  width: number;
  depth: number;
  volume: number;
  weight: number;
  weight_per_item: number;
  id: number;
  shopping_serial: string;
  shopping_serial_original: string;
  shopping_serial_max_sequence: number;
  quantity: number;
  total_amount: number;
  packing_type: string;
  prefer_price: string;
  qc_cost: number;
  packing_cost: number;
  extra_cost: number;
  other_cost: number;
  price: number;
  cost_price: number;
  selling_price: number;
  selling_price_unit: number;
  base_cost: number;
  base_profit: number;
  affiliate_cost: number;
  affiliate_profit: number;
  affiliate_commission: number;
  current_location: CurrentLocation;
  delivery_date: DeliveryDate;
  storage_cost: number;
  po_number: string;
  po_image_ids: imageIds[];
  product_image_ids: imageIds[];
  normal_image_ids: imageIds[];
  qc_image_ids: imageIds[];
  total_weight: number;
  total_volume: number;
}

interface CurrentLocation {
  id: number;
  name: string;
}

interface DeliveryDate {
  cn_checkin: string;
  cn_checkout: string;
  th_expected_checkin: string;
  th_checkin: string;
  th_checkout: string;
}

interface imageIds {
  url: string;
}
