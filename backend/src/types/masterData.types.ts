import { NamedRef } from './common.types';

// Seeded ids the business rules depend on (see src/seeds/masterData.ts)
export const LOCATION = { CN_WAREHOUSE: 1, TRANSIT: 2, TH_WAREHOUSE: 3, CUSTOMER: 4 } as const;
export const EXPRESS_CARRIER_ID = 2;
export const DEFAULT_DELIVERY_TYPE_ID = 1;
export const PAYMENT_SERVICE = 'payment';
export const COMPANY: NamedRef = { id: 1, name: 'BTC Cargo and Service Co., Ltd.' };

export interface DescribedItem extends NamedRef {
  description: string;
}

export interface ProductType extends DescribedItem {
  delivery_type: DescribedItem[];
}

export interface StockLocation {
  id: number;
  display_name: string;
}

export interface LocalDelivery extends NamedRef {
  province_codes: string[];
  sub_district_codes: string[];
}

export interface AlipayAccount extends NamedRef {
  note: string;
  active: boolean;
}

export interface CurrencyRate {
  id: number;
  name: string;
  rate: number;
  isOnline: boolean;
  createdAt: Date;
  modifiedAt: Date;
}
