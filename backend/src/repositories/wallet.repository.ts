import pool from '../database';
import { Queryable, Row } from '../types/database.types';
import { Wallet } from '../types/payment.types';
import { formatMoney, odooDateTime } from '../utils/format';
import { requireRow } from '../utils/rows';

export class WalletRepository {
  async list(userId: number, active: boolean | undefined, db: Queryable = pool): Promise<Wallet[]> {
    const params: unknown[] = [userId];
    const filter = active === undefined ? '' : ` AND active = $${params.push(active)}`;
    const { rows } = await db.query(
      `SELECT * FROM wallets WHERE user_id = $1${filter} ORDER BY id ASC`,
      params,
    );
    return rows.map(toWallet);
  }

  async findForUser(id: number, userId: number, db: Queryable = pool): Promise<Wallet | null> {
    const { rows } = await db.query('SELECT * FROM wallets WHERE id = $1 AND user_id = $2', [id, userId]);
    return rows[0] ? toWallet(rows[0]) : null;
  }

  async create(userId: number, name: string, db: Queryable = pool): Promise<Wallet> {
    const { rows } = await db.query('INSERT INTO wallets (user_id, name) VALUES ($1, $2) RETURNING *', [
      userId,
      name,
    ]);
    return toWallet(requireRow(rows, 'INSERT INTO wallets'));
  }

  async update(
    id: number,
    changes: { name?: string | undefined; active?: boolean | undefined },
    db: Queryable = pool,
  ): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (changes.name !== undefined) fields.push(`name = $${values.push(changes.name)}`);
    if (changes.active !== undefined) fields.push(`active = $${values.push(changes.active)}`);
    if (!fields.length) return;

    await db.query(`UPDATE wallets SET ${fields.join(', ')} WHERE id = $${values.push(id)}`, values);
  }

  async countActive(userId: number, db: Queryable = pool): Promise<number> {
    const { rows } = await db.query('SELECT COUNT(*) FROM wallets WHERE user_id = $1 AND active', [userId]);
    return Number(rows[0]?.count ?? 0);
  }

  async totalCredit(userId: number, db: Queryable = pool): Promise<number> {
    const { rows } = await db.query(
      'SELECT COALESCE(SUM(credit_amount), 0) AS total FROM wallets WHERE user_id = $1 AND active',
      [userId],
    );
    return Number(rows[0]?.total ?? 0);
  }

  // Row locks, taken in id order, so two exchange orders spending the same wallet cannot both
  // read the balance before either writes it
  async lockForUser(ids: number[], userId: number, tx: Queryable): Promise<Wallet[]> {
    const { rows } = await tx.query(
      `SELECT * FROM wallets WHERE id = ANY($1::int[]) AND user_id = $2 AND active
       ORDER BY id ASC FOR UPDATE`,
      [ids, userId],
    );
    return rows.map(toWallet);
  }

  async debit(id: number, amount: number, tx: Queryable): Promise<void> {
    await tx.query('UPDATE wallets SET credit_amount = credit_amount - $1 WHERE id = $2', [amount, id]);
  }
}

function toWallet(row: Row): Wallet {
  const credit = row.credit_amount as number;
  return {
    id: row.id as number,
    name: row.name as string,
    display_name: `${row.name as string} (${formatMoney(credit)} ¥)`,
    active: Boolean(row.active),
    credit_amount: credit,
    create_date: odooDateTime(row.created_at as Date),
    remark: row.remark as string,
  };
}
