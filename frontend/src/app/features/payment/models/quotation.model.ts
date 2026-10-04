import { ChinaTracking, Detail } from "./tracking";

export interface Quotation {
  is_checked: boolean;
  china_tracking: ChinaTracking;
}

export interface QuotationDetail extends Detail {
  is_checked: boolean;
}
