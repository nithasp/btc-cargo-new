import { withTransaction } from '../database';
import { QuotationInput } from '../schemas/sale.schema';
import { EXPRESS_CARRIER_ID } from '../types/masterData.types';
import { Paged, PageRequest } from '../types/pagination.types';
import { SaleSummaryRecord } from '../types/payment.types';
import { SaleServiceDeps } from '../types/service.types';
import { LotRow } from '../types/tracking.types';
import { AppError, notFound } from '../utils/errors';
import { round2 } from '../utils/format';
import { paged } from '../utils/pagination';

const invalid = (message: string) => new AppError(message, 400, 'invalid_request');

const total = (lots: LotRow[], pick: (lot: LotRow) => number): number =>
  round2(lots.reduce((sum, lot) => sum + pick(lot), 0));

export function createSaleService({
  lots,
  saleOrders,
  paymentGateways,
  masterData,
  affiliates,
  affiliateAccess,
  users,
  notifications,
}: SaleServiceDeps) {
  return {
    // Every amount is read from the locked lot rows; nothing the client sends sets a price (OWASP API3)
    async createQuotation(userId: number, input: QuotationInput) {
      const lotIds = [...new Set(input.china_tracking_ids)];

      if (!(await masterData.carrierExists(input.carrier_id))) throw invalid('carrier_id does not exist');

      const express = input.carrier_id === EXPRESS_CARRIER_ID;
      const localDeliveryId = express ? (input.local_delivery_id ?? null) : null;
      if (express) {
        if (localDeliveryId === null)
          throw invalid('local_delivery_id is required for private express delivery');
        if (!(await masterData.findLocalDelivery(localDeliveryId))) {
          throw invalid('local_delivery_id does not exist');
        }
      }

      const referralCode = await users.referralCodeOf(userId);
      const attribution = referralCode ? await affiliates.attributionByCode(referralCode) : null;

      return withTransaction(async (tx) => {
        const locked = await lots.lockReadyForUser(lotIds, userId, tx);
        if (locked.length !== lotIds.length) {
          throw invalid('Some parcels are not ready to be billed, or are already on a bill.');
        }

        const deliveryPrice = total(locked, (lot) => lot.delivery_cost);
        const otherCost = total(locked, (lot) => lot.other_cost + lot.th_other_cost);
        const storageCost = total(locked, (lot) => lot.storage_cost);
        const totalCost = round2(deliveryPrice + otherCost + storageCost);

        const order = await saleOrders.create(
          {
            userId,
            carrierId: input.carrier_id,
            localDeliveryId,
            deliveryAddress: input.delivery_address,
            invoiceAddress: input.invoice_address,
            deliveryPrice,
            otherCost,
            storageCost,
            totalCost,
            affiliateTeamId: attribution?.teamId ?? null,
            affiliateMemberId: attribution?.memberId ?? null,
            costPrice: attribution?.costPrice ?? 0,
            sellingPrice: attribution?.sellingPrice ?? 0,
            affiliateCommission: attribution ? round2((deliveryPrice * attribution.commissionRate) / 100) : 0,
          },
          tx,
        );
        await lots.assignSaleOrder(lotIds, order.id, tx);

        const bill = await paymentGateways.create(
          {
            userId,
            prefix: 'TP',
            serviceType: 'delivery',
            gatewayType: 'bank',
            state: totalCost > 0 ? 'wait' : 'done',
            quantity: locked.reduce((sum, lot) => sum + lot.quantity, 0),
            amountPay: totalCost,
            amountCurrency: totalCost,
            currency: 'THB',
            saleOrderId: order.id,
          },
          tx,
        );

        await notifications.notify(
          userId,
          {
            title: 'สร้างบิลค่าขนส่ง',
            message: `บิลเลขที่ ${bill.name} ยอดชำระ ${totalCost.toFixed(2)} บาท รอชำระเงิน`,
            link: `/web/payment-notice/${bill.id}`,
            linkText: 'แจ้งชำระเงิน',
          },
          tx,
        );

        return { id: order.id, name: order.name, payment_gateway_id: bill.id, payment_gateway: bill.name };
      });
    },

    async summary(userId: number, page: PageRequest): Promise<Paged<SaleSummaryRecord>> {
      const team = await affiliateAccess.requireTeam(userId);
      return paged(
        page,
        () => saleOrders.listForTeam(team.id, page),
        () => saleOrders.countForTeam(team.id),
      );
    },

    async setDiscount(userId: number, saleOrderId: number, amount: number): Promise<void> {
      const team = await affiliateAccess.requireTeam(userId);
      const discount = round2(amount);

      await withTransaction(async (tx) => {
        const commission = await saleOrders.lockCommissionForTeam(saleOrderId, team.id, tx);
        if (commission === null) throw notFound('Sale order');
        if (discount > commission) throw invalid('The discount cannot be more than the commission.');
        await saleOrders.setDiscount(saleOrderId, discount, tx);
      });
    },
  };
}

export type SaleService = ReturnType<typeof createSaleService>;
