export interface ProductVariant {
  id: number;
  display_name: string;
  key: string;
  is_active: boolean;
  has_stock: boolean;
  price: string;
  product: number;
}

export interface ProductUpload {
  id: number;
  file: string;
  type: string;
  product: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  is_active: boolean;
  is_simple: boolean;
  has_stock: boolean;
  shop: number;
  shop_name: string;
  variants: ProductVariant[];
  uploads: ProductUpload[];
}

export interface ImportOption {
  id: string;
  name: string;
}

export interface ImportTemplate {
  title: string;
  price: number;
  originalPrice: number;
  freight: string;
  images: string[];
  sizes: ImportOption[];
  colors: ImportOption[];
}
