import pool from '../database';
import { Address, AddressUpdate, NewAddress } from '../types/address.types';
import { Queryable, Row } from '../types/database.types';
import { requireRow } from '../utils/rows';

const COLUMNS: (keyof NewAddress)[] = [
  'name',
  'person',
  'telephone',
  'is_juristic',
  'vat',
  'address',
  'district',
];

export class AddressRepository {
  async listByUser(userId: number, db: Queryable = pool): Promise<Address[]> {
    const { rows } = await db.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY id ASC', [userId]);
    return rows.map(toAddress);
  }

  async findForUser(id: number, userId: number, db: Queryable = pool): Promise<Address | null> {
    const { rows } = await db.query('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
    return rows[0] ? toAddress(rows[0]) : null;
  }

  async create(userId: number, form: NewAddress, db: Queryable = pool): Promise<Address> {
    const { rows } = await db.query(
      `INSERT INTO addresses (user_id, name, person, telephone, is_juristic, vat, address, district)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, ...COLUMNS.map((column) => form[column])],
    );
    return toAddress(requireRow(rows, 'INSERT INTO addresses'));
  }

  async update(
    id: number,
    userId: number,
    changes: AddressUpdate,
    db: Queryable = pool,
  ): Promise<Address | null> {
    const fields: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];

    for (const column of COLUMNS) {
      if (changes[column] !== undefined) fields.push(`${column} = $${values.push(changes[column])}`);
    }

    const { rows } = await db.query(
      `UPDATE addresses SET ${fields.join(', ')}
       WHERE id = $${values.push(id)} AND user_id = $${values.push(userId)} RETURNING *`,
      values,
    );
    return rows[0] ? toAddress(rows[0]) : null;
  }

  async delete(id: number, userId: number, db: Queryable = pool): Promise<boolean> {
    const { rowCount } = await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
    return (rowCount ?? 0) > 0;
  }
}

function toAddress(row: Row): Address {
  return {
    id: row.id as number,
    name: row.name as string,
    person: row.person as string,
    telephone: row.telephone as string,
    is_juristic: Boolean(row.is_juristic),
    vat: row.vat as string,
    address: row.address as string,
    district: row.district as string,
    user: row.user_id as number,
  };
}
