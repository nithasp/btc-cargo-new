import { NamedRef } from './common.types';

export const BILL_STATES = ['wait', 'paid', 'done', 'cancel'] as const;

export type BillState = (typeof BILL_STATES)[number];

export type ServiceType = 'delivery' | 'payment';

export type GatewayType = 'bank' | 'alipay';

export interface Wallet {
  id: number;
  name: string;
  display_name: string;
  active: boolean;
  credit_amount: number;
  create_date: string | null;
  remark: string;
}

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

export interface NewSaleOrder {
  userId: number;
  carrierId: number;
  localDeliveryId: number | null;
  deliveryAddress: Record<string, unknown>;
  invoiceAddress: Record<string, unknown>;
  deliveryPrice: number;
  otherCost: number;
  storageCost: number;
  totalCost: number;
  affiliateTeamId: number | null;
  affiliateMemberId: number | null;
  costPrice: number;
  sellingPrice: number;
  affiliateCommission: number;
}

export interface SaleSummaryRecord {
  id: number;
  tracking_ids: string[];
  delivery_price: {
    delivery_price: number;
    other_cost: number;
    storage_cost: number;
    total_cost: number;
  };
  rate: { cost_price: number; selling_price: number };
  affiliate_commission: number;
  discount_commission: number;
  final_commission: number;
}
