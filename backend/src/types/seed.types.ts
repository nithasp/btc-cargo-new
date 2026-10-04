import { BillState, GatewayType } from './payment.types';
import { BoxType } from './tracking.types';

export type Rgb = [number, number, number];

export interface VariantSeed {
  name: string;
  key: string;
  price: number;
  color: Rgb;
}

export interface ProductSeed {
  name: string;
  description: string;
  price: number;
  color: Rgb;
  variants?: VariantSeed[];
}

export interface ShopSeed {
  name: string;
  products: ProductSeed[];
}

export interface ContentSeed {
  key: string;
  html: string;
}

export interface LocalDeliverySeed {
  id: number;
  name: string;
  provinceCodes: string[];
  subDistrictCodes: string[];
}

export type Stage = 'cn' | 'transit' | 'th';

export interface LotTotals {
  id: number;
  quantity: number;
  deliveryCost: number;
  otherCost: number;
  totalCost: number;
}

export interface LotOptions {
  userId: number;
  serial: string;
  stage: Stage;
  daysAgo: number;
  boxType?: BoxType;
  qc?: boolean;
  pending?: boolean;
  remarks?: string;
  note?: string;
  productImage?: string | null;
}

export interface BillSeed {
  daysAgo: number;
  state: BillState;
  lots?: number;
  gateway?: GatewayType;
  credit?: number;
}
