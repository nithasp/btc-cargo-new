import pool from '../database';
import { Queryable } from '../types/database.types';
import { PageRequest } from '../types/pagination.types';
import { LotRow } from '../types/tracking.types';
import { LOT_JSON, READY_LOT } from './tracking.repository';

const FROM_LOTS = 'FROM lots l JOIN stock_locations loc ON loc.id = l.current_location_id';
const PENDING = "l.confirm_state = 'pending'";

export class LotRepository {
  async listToConfirm(userId: number, page: PageRequest, db: Queryable = pool): Promise<LotRow[]> {
    const { rows } = await db.query(
      `SELECT ${LOT_JSON} AS lot ${FROM_LOTS}
       WHERE l.user_id = $1 AND ${PENDING}
       ORDER BY l.id DESC LIMIT $2 OFFSET $3`,
      [userId, page.limit, page.offset],
    );
    return rows.map((row) => row.lot as LotRow);
  }

  async countToConfirm(userId: number, db: Queryable = pool): Promise<number> {
    const { rows } = await db.query(`SELECT COUNT(*) FROM lots l WHERE l.user_id = $1 AND ${PENDING}`, [
      userId,
    ]);
    return Number(rows[0]?.count ?? 0);
  }

  async lockPendingForUser(id: number, userId: number, tx: Queryable): Promise<LotRow | null> {
    const { rows } = await tx.query(
      `SELECT ${LOT_JSON} AS lot ${FROM_LOTS}
       WHERE l.id = $1 AND l.user_id = $2 AND ${PENDING} FOR UPDATE OF l`,
      [id, userId],
    );
    return rows[0] ? (rows[0].lot as LotRow) : null;
  }

  async markSubmitted(id: number, uploadId: number, tx: Queryable): Promise<void> {
    await tx.query("UPDATE lots SET confirm_state = 'submitted', po_upload_id = $1 WHERE id = $2", [
      uploadId,
      id,
    ]);
  }

  // Locks the rows while the bill is built, so the same parcel cannot land on two bills
  async lockReadyForUser(ids: number[], userId: number, tx: Queryable): Promise<LotRow[]> {
    const { rows } = await tx.query(
      `SELECT ${LOT_JSON} AS lot ${FROM_LOTS}
       WHERE l.id = ANY($1::int[]) AND l.user_id = $2 AND ${READY_LOT}
       ORDER BY l.id ASC FOR UPDATE OF l`,
      [ids, userId],
    );
    return rows.map((row) => row.lot as LotRow);
  }

  async assignSaleOrder(ids: number[], saleOrderId: number, tx: Queryable): Promise<void> {
    await tx.query('UPDATE lots SET sale_order_id = $1 WHERE id = ANY($2::int[])', [saleOrderId, ids]);
  }
}
