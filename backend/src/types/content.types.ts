export interface HtmlContent {
  id: number;
  key: string;
  html: string;
  plain: string;
}

export interface NotificationItem {
  unread: boolean;
  notification: {
    id: number;
    actor: string;
    title: string;
    message: string;
    link: string;
    link_text: string;
    line_notify: string;
    timestamp: Date;
  };
}

export interface NewNotification {
  actor?: string | undefined;
  title: string;
  message: string;
  link?: string | undefined;
  linkText?: string | undefined;
}

export interface NotificationPage {
  data: NotificationItem[];
  page: { count: number; next: string | null; previous: string | null };
}

export interface Cart {
  id: number;
  json: unknown[];
  user: number;
}

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
