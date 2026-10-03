export interface Uploads {
  id: number;
  file: string;
  type: string;
  product: number;
}
export interface Variants {
  id: number;
  display_name: string;
  key: string;
  is_active: boolean;
  has_stock: boolean;
  price: string;
  product: number;
}

export interface CartData {
  id: number;
  variants: Variants;
  uploads: Uploads;
  shop_name: string;
  name: string;
  is_active: boolean;
  is_simple: boolean;
  has_stock: boolean;
  description: string;
  price: number;
  shop: number;
  quantity: number;
  totalPrice: number;
  selected: boolean;
}

export interface ProductData extends Omit<CartData, "uploads"> {
  uploads: Uploads[];
}
