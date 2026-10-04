import { config } from '../config';
import { withTransaction } from '../database';
import { ExchangeInput, PaymentInput } from '../schemas/payment.schema';
import { COMPANY, PAYMENT_SERVICE } from '../types/masterData.types';
import { Paged, PageRequest } from '../types/pagination.types';
import { Bill, BillState, PaymentGatewayRecord, ServiceType } from '../types/payment.types';
import { PaymentGatewayServiceDeps } from '../types/service.types';
import { AppError, notFound } from '../utils/errors';
import { formatMoney, odooDateTime, round2 } from '../utils/format';
import { paged } from '../utils/pagination';

const STATUS_LABELS: Record<BillState, string> = {
  wait: 'รอชำระเงิน',
  paid: 'รอตรวจสอบการชำระเงิน',
  done: 'ชำระเงินสำเร็จ',
  cancel: 'ยกเลิก',
};

const CURRENCY_IDS: Record<string, number> = { THB: 1, CNY: 2 };

const invalid = (message: string) => new AppError(message, 400, 'invalid_request');

function toRecord(bill: Bill): PaymentGatewayRecord {
  return {
    id: bill.id,
    name: bill.name,
    service_type: bill.serviceType,
    status: STATUS_LABELS[bill.state],
    state: bill.state,
    gateway_type: bill.gatewayType,
    account_type: bill.accountType,
    amount_pay: bill.amountPay,
    amount_currency: bill.amountCurrency,
    quantity_with_symbol:
      bill.serviceType === 'delivery' ? `${bill.quantity} ชิ้น` : `${formatMoney(bill.quantity)} ¥`,
    thai_amount_with_symbol: `${formatMoney(bill.amountCurrency)} ฿`,
    partner: { id: bill.userId, name: bill.partnerName },
    company: COMPANY,
    currency: { id: CURRENCY_IDS[bill.currency] ?? 0, name: bill.currency },
    partner_image_url: [],
    create_date: odooDateTime(bill.createdAt),
  };
}

function firstImageUrl(images: unknown): string | null {
  if (!Array.isArray(images)) return null;
  const url = (images[0] as { url?: unknown } | undefined)?.url;
  return typeof url === 'string' && url.length > 0 ? url : null;
}

function parsePaidAt(value: string | null | undefined): Date {
  const parsed = value ? new Date(`${value.replace(' ', 'T')}Z`) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
}

export function createPaymentGatewayService({
  paymentGateways,
  wallets,
  masterData,
  uploads,
  verification,
  notifications,
}: PaymentGatewayServiceDeps) {
  // No back office here either: a reported payment is confirmed once it is older than
  // DEMO_AUTO_APPROVE_SECONDS (0 leaves it waiting for review)
  async function confirmReportedPayments(userId: number): Promise<void> {
    const seconds = config.demo.autoApproveSeconds;
    if (seconds <= 0) return;

    for (const name of await paymentGateways.confirmPaidOlderThan(userId, seconds)) {
      notifications.notifyQuietly(userId, {
        title: 'ยืนยันการชำระเงิน',
        message: `ตรวจสอบการชำระเงินของบิล ${name} เรียบร้อยแล้ว`,
        link: '/web/bills',
        linkText: 'ดูบิลทั้งหมด',
      });
    }
  }

  async function requireRecord(userId: number, id: number): Promise<PaymentGatewayRecord> {
    const bill = await paymentGateways.findForUser(id, userId);
    if (!bill) throw notFound('Bill');
    return toRecord(bill);
  }

  return {
    async list(
      userId: number,
      service: ServiceType | undefined,
      page: PageRequest,
    ): Promise<Paged<PaymentGatewayRecord>> {
      await confirmReportedPayments(userId);
      return paged(
        page,
        async () => (await paymentGateways.list(userId, service, page)).map(toRecord),
        () => paymentGateways.count(userId, service),
      );
    },

    async find(userId: number, id: number): Promise<PaymentGatewayRecord | null> {
      await confirmReportedPayments(userId);
      const bill = await paymentGateways.findForUser(id, userId);
      return bill ? toRecord(bill) : null;
    },

    // The THB amount is always computed here from the stored rate; the client only says how many
    // yuan and, for Alipay, how much wallet credit to spend (OWASP API3)
    async createExchange(userId: number, input: ExchangeInput): Promise<PaymentGatewayRecord> {
      await verification.requireVerified(userId, 'partner');

      const currency = await masterData.currency(PAYMENT_SERVICE);
      if (!currency?.isOnline) {
        throw new AppError('The exchange service is closed at the moment.', 409, 'conflict');
      }

      const announce = (bill: { id: number; name: string }, due: number) => ({
        title: 'สร้างรายการแลกเงิน',
        message: `รายการ ${bill.name} ยอดชำระ ${formatMoney(due)} บาท`,
        link: due > 0 ? `/web/payment-notice/${bill.id}` : '/web/create-exchange',
        linkText: due > 0 ? 'แจ้งชำระเงิน' : 'ดูรายการ',
      });

      if (input.payment_gateway_type === 'bank') {
        const account =
          input.account_type === 'img' && input.account_url
            ? await uploads.resolveOwned(userId, input.account_url)
            : null;
        const due = round2(input.amount * currency.rate);

        const bill = await withTransaction(async (tx) => {
          const created = await paymentGateways.create(
            {
              userId,
              prefix: 'EX',
              serviceType: 'payment',
              gatewayType: 'bank',
              accountType: input.account_type,
              accountName: input.account_type === 'detail' ? input.account_name : null,
              accountNumber: input.account_type === 'detail' ? input.account_number : null,
              accountUploadId: account?.id ?? null,
              description: input.description,
              state: 'wait',
              quantity: input.amount,
              amountPay: input.amount,
              amountCurrency: due,
              rate: currency.rate,
              currency: currency.name,
            },
            tx,
          );
          await notifications.notify(userId, announce(created, due), tx);
          return created;
        });
        return requireRecord(userId, bill.id);
      }

      if (!(await masterData.alipayAccountActive(input.alipay_account_id))) {
        throw invalid('alipay_account_id does not exist');
      }

      const amount = round2(input.amount_split.reduce((sum, split) => sum + split.amount, 0));
      const creditUsed = round2(input.amount_split.reduce((sum, split) => sum + split.use_credit_amount, 0));
      if (creditUsed > amount) throw invalid('The wallet credit used cannot be more than the amount.');

      const perWallet = new Map<number, number>();
      for (const split of input.amount_split) {
        perWallet.set(split.wallet_id, (perWallet.get(split.wallet_id) ?? 0) + split.use_credit_amount);
      }

      const bill = await withTransaction(async (tx) => {
        const locked = await wallets.lockForUser([...perWallet.keys()], userId, tx);
        if (locked.length !== perWallet.size) throw invalid('A selected wallet does not exist.');

        for (const wallet of locked) {
          const spend = round2(perWallet.get(wallet.id) ?? 0);
          if (spend > wallet.credit_amount) {
            throw invalid(`Wallet "${wallet.name}" does not have enough credit.`);
          }
          if (spend > 0) await wallets.debit(wallet.id, spend, tx);
        }

        const due = round2((amount - creditUsed) * currency.rate);
        const created = await paymentGateways.create(
          {
            userId,
            prefix: 'EX',
            serviceType: 'payment',
            gatewayType: 'alipay',
            alipayAccountId: input.alipay_account_id,
            description: input.description,
            state: due > 0 ? 'wait' : 'done',
            quantity: amount,
            amountPay: amount,
            amountCurrency: due,
            creditUsed,
            rate: currency.rate,
            currency: currency.name,
            amountSplit: input.amount_split,
          },
          tx,
        );
        await notifications.notify(userId, announce(created, due), tx);
        return created;
      });
      return requireRecord(userId, bill.id);
    },

    async createPayment(userId: number, input: PaymentInput): Promise<{ id: number }> {
      const slipUrl = firstImageUrl(input.image_ids);
      const slip = slipUrl ? await uploads.resolveOwned(userId, slipUrl) : null;

      return withTransaction(async (tx) => {
        const bill = await paymentGateways.lockForUser(input.payment_gateway_id, userId, tx);
        if (!bill) throw notFound('Bill');
        if (bill.state !== 'wait')
          throw new AppError('This bill is not waiting for payment.', 409, 'conflict');

        const id = await paymentGateways.createPayment(
          {
            paymentGatewayId: bill.id,
            userId,
            amount: round2(input.amount),
            paidAt: parsePaidAt(input.payment_date_time),
            slipUploadId: slip?.id ?? null,
          },
          tx,
        );
        await paymentGateways.markPaid(bill.id, tx);

        await notifications.notify(
          userId,
          {
            title: 'แจ้งชำระเงิน',
            message: `ได้รับแจ้งชำระเงินของบิล ${bill.name} แล้ว อยู่ระหว่างตรวจสอบ`,
            link: '/web/bills',
            linkText: 'ดูบิลทั้งหมด',
          },
          tx,
        );
        return { id };
      });
    },
  };
}

export type PaymentGatewayService = ReturnType<typeof createPaymentGatewayService>;
