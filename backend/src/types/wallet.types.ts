export interface Wallet {
  id: number;
  name: string;
  display_name: string;
  active: boolean;
  credit_amount: number;
  create_date: string | null;
  remark: string;
}
