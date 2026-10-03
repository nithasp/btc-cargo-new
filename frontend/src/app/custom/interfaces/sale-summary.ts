import { Pagination } from "./pagination";

export interface SaleSummaryResponse {
  records: SaleSummaryRecords[];
  pagination: Pagination;
}

export interface SaleSummaryRecords {
  id: number;
  tracking_ids: string[];
  delivery_price: DeliveryPrice;
  rate: Rate;
  affiliate_commission: number;
  discount_commission: number;
  final_commission: number;
}

interface DeliveryPrice {
  delivery_price: number;
  other_cost: number;
  storage_cost: number;
  total_cost: number;
}

interface Rate {
  cost_price: number;
  selling_price: number;
}
