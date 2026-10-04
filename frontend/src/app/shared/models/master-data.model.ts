export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface System {
  system_date?: string;
  api_version?: string;
}

export interface ProductType {
  id?: number;
  name?: string;
  description?: string;
  delivery_type?: DeliveryType[];
}

export interface StockPickingType {
  id?: number;
  name?: string;
}

export interface StockLocation {
  id?: number;
  display_name?: string;
}

export interface ShopType {
  id?: number;
  name?: string;
  description?: string;
}

export interface ThaiCarrier {
  id?: number;
  name?: string;
}

export interface DeliveryType {
  id?: number;
  name?: string;
  description?: string;
}

export interface LocalDelivery {
  id?: number;
  name?: string;
  province_codes?: string[];
  sub_district_codes?: string[];
}
