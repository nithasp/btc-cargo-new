import pool from '../database';
import { Queryable, Row } from '../types/database.types';
import { PageRequest } from '../types/pagination.types';
import { DailyCommission, DateRange, MemberCommission } from '../types/report.types';
import { NewSaleOrder, SaleSummaryRecord } from '../types/sale.types';
import { round2 } from '../utils/format';
import { requireRow } from '../utils/rows';

const LOCAL_DAY = "(so.created_at AT TIME ZONE 'Asia/Bangkok')::date";

export class SaleOrderRepository {
  async create(order: NewSaleOrder, tx: Queryable): Promise<{ id: number; name: string }> {
    const { rows } = await tx.query(
      `WITH next AS (SELECT nextval('sale_orders_id_seq') AS id)
       INSERT INTO sale_orders
         (id, name, user_id, carrier_id, local_delivery_id, delivery_address, invoice_address,
          delivery_price, other_cost, storage_cost, total_cost,
          affiliate_team_id, affiliate_member_id, cost_price, selling_price, affiliate_commission)
       SELECT next.id, 'SO' || to_char(NOW(), 'YYMM') || '-' || lpad(next.id::text, 5, '0'),
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
       FROM next
       RETURNING id, name`,
      [
        order.userId,
        order.carrierId,
        order.localDeliveryId,
        JSON.stringify(order.deliveryAddress),
        JSON.stringify(order.invoiceAddress),
        order.deliveryPrice,
        order.otherCost,
        order.storageCost,
        order.totalCost,
        order.affiliateTeamId,
        order.affiliateMemberId,
        order.costPrice,
        order.sellingPrice,
        order.affiliateCommission,
      ],
    );
    const row = requireRow(rows, 'INSERT INTO sale_orders');
    return { id: row.id as number, name: row.name as string };
  }

  async listForTeam(teamId: number, page: PageRequest, db: Queryable = pool): Promise<SaleSummaryRecord[]> {
    const { rows } = await db.query(
      `SELECT so.*,
              COALESCE((SELECT array_agg(l.shopping_serial ORDER BY l.id)
                        FROM lots l WHERE l.sale_order_id = so.id), '{}') AS tracking_ids
       FROM sale_orders so
       WHERE so.affiliate_team_id = $1
       ORDER BY so.id DESC LIMIT $2 OFFSET $3`,
      [teamId, page.limit, page.offset],
    );
    return rows.map(toSummary);
  }

  async countForTeam(teamId: number, db: Queryable = pool): Promise<number> {
    const { rows } = await db.query('SELECT COUNT(*) FROM sale_orders WHERE affiliate_team_id = $1', [
      teamId,
    ]);
    return Number(rows[0]?.count ?? 0);
  }

  async lockCommissionForTeam(id: number, teamId: number, tx: Queryable): Promise<number | null> {
    const { rows } = await tx.query(
      'SELECT affiliate_commission FROM sale_orders WHERE id = $1 AND affiliate_team_id = $2 FOR UPDATE',
      [id, teamId],
    );
    return rows[0] ? (rows[0].affiliate_commission as number) : null;
  }

  async setDiscount(id: number, amount: number, tx: Queryable): Promise<void> {
    await tx.query('UPDATE sale_orders SET discount_commission = $1 WHERE id = $2', [amount, id]);
  }

  async commissionByDay(teamId: number, range: DateRange, db: Queryable = pool): Promise<DailyCommission[]> {
    const { rows } = await db.query<DailyCommission>(
      `SELECT to_char(${LOCAL_DAY}, 'YYYY-MM-DD') AS day,
              COUNT(*) AS orders,
              COALESCE(SUM(so.delivery_price), 0) AS delivery,
              COALESCE(SUM(so.affiliate_commission), 0) AS commission,
              COALESCE(SUM(so.discount_commission), 0) AS discount
       FROM sale_orders so
       WHERE so.affiliate_team_id = $1 AND ${LOCAL_DAY} BETWEEN $2::date AND $3::date
       GROUP BY 1 ORDER BY 1`,
      [teamId, range.start, range.end],
    );
    return rows;
  }

  async commissionByMember(
    teamId: number,
    range: DateRange,
    db: Queryable = pool,
  ): Promise<MemberCommission[]> {
    const { rows } = await db.query<MemberCommission>(
      `SELECT m.affiliate_code, m.name,
              COUNT(so.id) AS orders,
              COALESCE(SUM(so.delivery_price), 0) AS delivery,
              COALESCE(SUM(so.affiliate_commission - so.discount_commission), 0) AS commission
       FROM affiliate_members m
       LEFT JOIN sale_orders so
         ON so.affiliate_member_id = m.id AND ${LOCAL_DAY} BETWEEN $2::date AND $3::date
       WHERE m.team_id = $1
       GROUP BY m.id
       ORDER BY commission DESC, m.id ASC`,
      [teamId, range.start, range.end],
    );
    return rows;
  }
}

function toSummary(row: Row): SaleSummaryRecord {
  const commission = row.affiliate_commission as number;
  const discount = row.discount_commission as number;
  return {
    id: row.id as number,
    tracking_ids: (row.tracking_ids as string[] | null) ?? [],
    delivery_price: {
      delivery_price: row.delivery_price as number,
      other_cost: row.other_cost as number,
      storage_cost: row.storage_cost as number,
      total_cost: row.total_cost as number,
    },
    rate: { cost_price: row.cost_price as number, selling_price: row.selling_price as number },
    affiliate_commission: commission,
    discount_commission: discount,
    final_commission: round2(commission - discount),
  };
}
