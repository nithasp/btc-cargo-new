import { CartData } from "./cart";

export interface Shop {
  shop_id: number;
  shop_name: string;
  products: CartData[];
}
