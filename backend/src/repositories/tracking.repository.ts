import pool from '../database';
import { Queryable, Row } from '../types/database.types';
import { LOCATION } from '../types/masterData.types';
import { PageRequest } from '../types/pagination.types';
import {
  BoxType,
  ChinaTracking,
  LotRow,
  NewTracking,
  TrackingUpdate,
  TrackingWithLot,
} from '../types/tracking.types';
import { requireRow } from '../utils/rows';

export const READY_LOT = `l.id IS NOT NULL
  AND l.current_location_id = ${LOCATION.TH_WAREHOUSE}
  AND l.sale_order_id IS NULL
  AND l.confirm_state <> 'pending'`;

export const LOT_JSON = `to_jsonb(l) || jsonb_build_object('location_name', loc.display_name)`;

const FROM_TRACKINGS = `FROM china_trackings ct
  LEFT JOIN lots l ON l.id = ct.lot_id
  LEFT JOIN stock_locations loc ON loc.id = l.current_location_id`;

export class TrackingRepository {
  async listDetails(
    userId: number,
    readyOnly: boolean,
    page: PageRequest,
    db: Queryable = pool,
  ): Promise<TrackingWithLot[]> {
    const { rows } = await db.query(
      `SELECT ct.*, (${READY_LOT}) AS is_ready,
              CASE WHEN l.id IS NULL THEN NULL ELSE ${LOT_JSON} END AS lot
       ${FROM_TRACKINGS}
       WHERE ct.user_id = $1${readyOnly ? ` AND ${READY_LOT}` : ''}
       ORDER BY ct.id DESC LIMIT $2 OFFSET $3`,
      [userId, page.limit, page.offset],
    );
    return rows.map((row) => ({ tracking: toTracking(row), lot: (row.lot as LotRow | null) ?? null }));
  }

  async count(userId: number, readyOnly: boolean, db: Queryable = pool): Promise<number> {
    const { rows } = await db.query(
      `SELECT COUNT(*) ${FROM_TRACKINGS} WHERE ct.user_id = $1${readyOnly ? ` AND ${READY_LOT}` : ''}`,
      [userId],
    );
    return Number(rows[0]?.count ?? 0);
  }

  async existsAny(serials: string[], db: Queryable = pool): Promise<boolean> {
    const { rows } = await db.query(
      'SELECT 1 FROM china_trackings WHERE UPPER(shopping_serial) = ANY($1::text[]) LIMIT 1',
      [serials.map((serial) => serial.toUpperCase())],
    );
    return rows.length > 0;
  }

  async findBySerial(
    serial: string,
    db: Queryable = pool,
  ): Promise<(ChinaTracking & { user: number }) | null> {
    const { rows } = await db.query(
      'SELECT ct.*, false AS is_ready FROM china_trackings ct WHERE UPPER(ct.shopping_serial) = UPPER($1)',
      [serial],
    );
    return rows[0] ? { ...toTracking(rows[0]), user: rows[0].user_id as number } : null;
  }

  async create(
    userId: number,
    item: NewTracking,
    lotId: number | null,
    db: Queryable = pool,
  ): Promise<ChinaTracking> {
    const { rows } = await db.query(
      `INSERT INTO china_trackings
         (user_id, shopping_serial, delivery_type_id, shipping_with_box, qc, required_picture, remarks, lot_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *, false AS is_ready`,
      [
        userId,
        item.shoppingSerial,
        item.deliveryTypeId,
        item.shippingWithBox,
        item.qc,
        item.requiredPicture,
        item.remarks,
        lotId,
      ],
    );
    return toTracking(requireRow(rows, 'INSERT INTO china_trackings'));
  }

  async attachLot(id: number, lotId: number, db: Queryable = pool): Promise<void> {
    await db.query('UPDATE china_trackings SET lot_id = $1 WHERE id = $2', [lotId, id]);
  }

  async updatePending(userId: number, change: TrackingUpdate, db: Queryable = pool): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (column: string, value: unknown) => {
      if (value !== undefined) fields.push(`${column} = $${values.push(value)}`);
    };

    set('delivery_type_id', change.deliveryTypeId);
    set('shipping_with_box', change.shippingWithBox);
    set('qc', change.qc);
    set('required_picture', change.requiredPicture);
    set('remarks', change.remarks);

    const assignments = fields.length ? fields.join(', ') : 'remarks = remarks';
    const { rowCount } = await db.query(
      `UPDATE china_trackings SET ${assignments}
       WHERE id = $${values.push(change.id)} AND user_id = $${values.push(userId)} AND lot_id IS NULL`,
      values,
    );
    return (rowCount ?? 0) > 0;
  }
}

function toTracking(row: Row): ChinaTracking {
  return {
    id: row.id as number,
    partner_id: String(row.user_id),
    delivery_type: row.delivery_type_id as number,
    shopping_serial: row.shopping_serial as string,
    qc: Boolean(row.qc),
    required_picture: Boolean(row.required_picture),
    is_ready: Boolean(row.is_ready),
    lot_id: (row.lot_id as number | null) ?? null,
    delivery_address: null,
    shipping_with_box: row.shipping_with_box as BoxType,
    remarks: row.remarks as string,
  };
}
