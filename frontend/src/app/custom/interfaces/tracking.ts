import { Pagination } from "./pagination"
import { ApiResponse } from './master-data'
export interface TrackingValidation {
    exist: boolean
}

export interface Details {
    records: Detail[]
    pagination: Pagination
}

export interface ChinaTrackingDetails {
  records: ChinaTracking[]
  pagination: Pagination
}

export interface Detail {
  china_tracking: ChinaTracking | null
  lot: Lot | null
}

export interface ChinaTracking {
  id?: number | null
  partner_id?: string | null
  delivery_type?: number | null
  shopping_serial?: string | null
  qc?: boolean | null
  required_picture?: boolean | null
  is_ready?: boolean | null
  lot_id?: number | null
  delivery_address?: any | null
  shipping_with_box?: string | null
}

interface Lot {
  id?: number | null;
  lot_id?: number | null;
  serial_number?: string | null;
  child_ids: ChildId[] | null;
  po_image_ids: string[] | null;
  image_ids: string[] | null;
  qc_image_ids?: string[] | null;
  current_location?: CurrentLocation | null;
  shopping_serial?: string | null;
  po_number?: string | null;
  packing_type?: string | null;
  packing_cost?: string | null;
  counting_note?: string | null;
  qc_cost?: number | null;
  remarks?: string | null;
  total_amount?: number | null;
  extra_cost?: number | null;
  shipping_lot?: string | null;
}

interface ChildId {
  id?: number | null
  weight?: number | null
  height?: number | null
  width?: number | null
  depth?: number | null
  volume?: number | null
  weight_per_item?: number | null
  product_type?: number | null
}

interface  CurrentLocation {
  id?: number | null
  name?: string | null
}