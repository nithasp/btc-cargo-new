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
