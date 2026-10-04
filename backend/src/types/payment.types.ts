import { NamedRef } from './common.types';

export const BILL_STATES = ['wait', 'paid', 'done', 'cancel'] as const;

export type BillState = (typeof BILL_STATES)[number];

export type ServiceType = 'delivery' | 'payment';

export type GatewayType = 'bank' | 'alipay';

export interface AmountSplit {
  wallet_id: number;
  amount: number;
  use_credit_amount: number;
}

export interface NewPaymentGateway {
  userId: number;
  prefix: string;
  serviceType: ServiceType;
  gatewayType: GatewayType;
  accountType?: 'detail' | 'img' | null | undefined;
  accountName?: string | null | undefined;
  accountNumber?: string | null | undefined;
  accountUploadId?: number | null | undefined;
  alipayAccountId?: number | null | undefined;
  description?: string | undefined;
  state: BillState;
  quantity: number;
  amountPay: number;
  amountCurrency: number;
  creditUsed?: number | undefined;
  rate?: number | undefined;
  currency: string;
  amountSplit?: AmountSplit[] | undefined;
  saleOrderId?: number | null | undefined;
}

export interface Bill {
  id: number;
  userId: number;
  name: string;
  serviceType: ServiceType;
  gatewayType: GatewayType;
  accountType: 'detail' | 'img' | null;
  state: BillState;
  quantity: number;
  amountPay: number;
  amountCurrency: number;
  currency: string;
  partnerName: string;
  createdAt: Date;
}

export interface PaymentGatewayRecord {
  id: number;
  name: string;
  service_type: ServiceType;
  status: string;
  state: BillState;
  gateway_type: GatewayType;
  account_type: 'detail' | 'img' | null;
  amount_pay: number;
  amount_currency: number;
  quantity_with_symbol: string;
  thai_amount_with_symbol: string;
  partner: NamedRef;
  company: NamedRef;
  currency: NamedRef;
  partner_image_url: never[];
  create_date: string | null;
}

export interface NewPayment {
  paymentGatewayId: number;
  userId: number;
  amount: number;
  paidAt: Date;
  slipUploadId: number | null;
}
