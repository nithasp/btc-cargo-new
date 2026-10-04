import pool from '../database';
import { Cart } from '../types/cart.types';
import { Queryable, Row } from '../types/database.types';
import { requireRow } from '../utils/rows';

export class CartRepository {
  async findByUser(userId: number, db: Queryable = pool): Promise<Cart | null> {
    const { rows } = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    return rows[0] ? toCart(rows[0]) : null;
  }

  async upsert(userId: number, json: unknown[], db: Queryable = pool): Promise<Cart> {
    const { rows } = await db.query(
      `INSERT INTO carts (user_id, json) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET json = EXCLUDED.json, updated_at = NOW()
       RETURNING *`,
      [userId, JSON.stringify(json)],
    );
    return toCart(requireRow(rows, 'INSERT INTO carts'));
  }

  async update(id: number, userId: number, json: unknown[], db: Queryable = pool): Promise<Cart | null> {
    const { rows } = await db.query(
      'UPDATE carts SET json = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [JSON.stringify(json), id, userId],
    );
    return rows[0] ? toCart(rows[0]) : null;
  }
}

function toCart(row: Row): Cart {
  return {
    id: row.id as number,
    json: (row.json as unknown[] | null) ?? [],
    user: row.user_id as number,
  };
}
