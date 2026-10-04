import pool from '../database';
import { Queryable, Row } from '../types/database.types';
import { PageRequest } from '../types/pagination.types';
import {
  Bill,
  BillState,
  GatewayType,
  NewPayment,
  NewPaymentGateway,
  ServiceType,
} from '../types/payment.types';
import { requireRow } from '../utils/rows';

const SELECT_BILL = `SELECT pg.*,
    COALESCE(NULLIF(TRIM(u.first_name || ' ' || u.last_name), ''), u.username) AS partner_name
  FROM payment_gateways pg
  JOIN users u ON u.id = pg.user_id`;

function where(userId: number, service: ServiceType | undefined, params: unknown[]): string {
  const owner = ` WHERE pg.user_id = $${params.push(userId)}`;
  return service ? `${owner} AND pg.service_type = $${params.push(service)}` : owner;
}

export class PaymentGatewayRepository {
  async create(bill: NewPaymentGateway, tx: Queryable): Promise<{ id: number; name: string }> {
    const { rows } = await tx.query(
      `WITH next AS (SELECT nextval('payment_gateways_id_seq') AS id)
       INSERT INTO payment_gateways
         (id, name, user_id, service_type, gateway_type, account_type, account_name, account_number,
          account_upload_id, alipay_account_id, description, state, quantity, amount_pay,
          amount_currency, credit_used, rate, currency, amount_split, sale_order_id, paid_at)
       SELECT next.id, $1 || to_char(NOW(), 'YYMM') || '-' || lpad(next.id::text, 5, '0'),
              $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
       FROM next
       RETURNING id, name`,
      [
        bill.prefix,
        bill.userId,
        bill.serviceType,
        bill.gatewayType,
        bill.accountType ?? null,
        bill.accountName ?? null,
        bill.accountNumber ?? null,
        bill.accountUploadId ?? null,
        bill.alipayAccountId ?? null,
        bill.description ?? '',
        bill.state,
        bill.quantity,
        bill.amountPay,
        bill.amountCurrency,
        bill.creditUsed ?? 0,
        bill.rate ?? 1,
        bill.currency,
        JSON.stringify(bill.amountSplit ?? []),
        bill.saleOrderId ?? null,
        bill.state === 'wait' ? null : new Date(),
      ],
    );
    const row = requireRow(rows, 'INSERT INTO payment_gateways');
    return { id: row.id as number, name: row.name as string };
  }

  async list(
    userId: number,
    service: ServiceType | undefined,
    page: PageRequest,
    db: Queryable = pool,
  ): Promise<Bill[]> {
    const params: unknown[] = [];
    const sql = `${SELECT_BILL}${where(userId, service, params)}
                 ORDER BY pg.id DESC LIMIT $${params.push(page.limit)} OFFSET $${params.push(page.offset)}`;
    const { rows } = await db.query(sql, params);
    return rows.map(toBill);
  }

  async count(userId: number, service: ServiceType | undefined, db: Queryable = pool): Promise<number> {
    const params: unknown[] = [];
    const { rows } = await db.query(
      `SELECT COUNT(*) FROM payment_gateways pg${where(userId, service, params)}`,
      params,
    );
    return Number(rows[0]?.count ?? 0);
  }

  async findForUser(id: number, userId: number, db: Queryable = pool): Promise<Bill | null> {
    const { rows } = await db.query(`${SELECT_BILL} WHERE pg.id = $1 AND pg.user_id = $2`, [id, userId]);
    return rows[0] ? toBill(rows[0]) : null;
  }

  async lockForUser(id: number, userId: number, tx: Queryable): Promise<Bill | null> {
    const { rows } = await tx.query(`${SELECT_BILL} WHERE pg.id = $1 AND pg.user_id = $2 FOR UPDATE OF pg`, [
      id,
      userId,
    ]);
    return rows[0] ? toBill(rows[0]) : null;
  }

  async markPaid(id: number, tx: Queryable): Promise<void> {
    await tx.query("UPDATE payment_gateways SET state = 'paid', paid_at = NOW() WHERE id = $1", [id]);
  }

  async confirmPaidOlderThan(userId: number, seconds: number, db: Queryable = pool): Promise<string[]> {
    const { rows } = await db.query(
      `UPDATE payment_gateways SET state = 'done'
       WHERE user_id = $1 AND state = 'paid' AND paid_at <= NOW() - make_interval(secs => $2)
       RETURNING name`,
      [userId, seconds],
    );
    return rows.map((row) => row.name as string);
  }

  async createPayment(payment: NewPayment, tx: Queryable): Promise<number> {
    const { rows } = await tx.query(
      `INSERT INTO payments (payment_gateway_id, user_id, amount, paid_at, slip_upload_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [payment.paymentGatewayId, payment.userId, payment.amount, payment.paidAt, payment.slipUploadId],
    );
    return requireRow(rows, 'INSERT INTO payments').id as number;
  }
}

function toBill(row: Row): Bill {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    name: row.name as string,
    serviceType: row.service_type as ServiceType,
    gatewayType: row.gateway_type as GatewayType,
    accountType: (row.account_type as Bill['accountType']) ?? null,
    state: row.state as BillState,
    quantity: row.quantity as number,
    amountPay: row.amount_pay as number,
    amountCurrency: row.amount_currency as number,
    currency: row.currency as string,
    partnerName: row.partner_name as string,
    createdAt: row.created_at as Date,
  };
}
