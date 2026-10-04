import { Pagination } from "./pagination";

export interface PaymentGatewayApiReponse {
  pagination: Pagination;
  records: PaymentGatewayRecords[];
}

export interface PaymentGatewayRecords {
  service_type: string;
  status: string;
  quantity_with_symbol: string;
  thai_amount_with_symbol: string;
  id: number;
  name: string;
  gateway_type: string;
  account_type: string;
  amount_pay: number;
  state: string;
  amount_currency: number;
  partner: {
    id: number;
    name: string;
  };
  company: {
    id: number;
    name: string;
  };
  currency: {
    id: number;
    name: string;
  };
  partner_image_url?: [
    {
      id: number;
      url: string;
      image_category: string;
    }
  ];
}

export interface Account {
  id: number
  name: string
  active: boolean
}

export interface PaymentAccount {
  bankName: string
  branchName: string
  accountName: string
  accountTypeName: string
  accountNumber: string
}
