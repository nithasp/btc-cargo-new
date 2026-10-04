import { CartData } from "./cart.model";

export interface Shop {
  shop_id: number;
  shop_name: string;
  products: CartData[];
}
