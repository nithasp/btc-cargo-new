import pool from '../database';
import { Queryable, Row } from '../types/database.types';
import { AuthUser, NewUserRow, StoredUser, UserDetails, UserRole, UserUpdate } from '../types/user.types';
import { requireRow } from '../utils/rows';

const AUTH_FIELDS = 'id, username, role';

const UPDATE_COLUMNS: Record<keyof UserUpdate, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
  gender: 'gender',
  telephone: 'telephone',
  line: 'line',
  facebook: 'facebook',
  google: 'google',
  affiliateName: 'affiliate_name',
  birthDate: 'birth_date',
  billingAddressId: 'billing_address_id',
  shippingAddressId: 'shipping_address_id',
  hasConsent: 'has_consent',
};

export class UserRepository {
  async findAuthById(id: number, db: Queryable = pool): Promise<AuthUser | null> {
    const { rows } = await db.query(`SELECT ${AUTH_FIELDS} FROM users WHERE id = $1`, [id]);
    return rows[0] ? toAuthUser(rows[0]) : null;
  }

  async findAuthByUsername(username: string, db: Queryable = pool): Promise<AuthUser | null> {
    const { rows } = await db.query(`SELECT ${AUTH_FIELDS} FROM users WHERE LOWER(username) = LOWER($1)`, [
      username,
    ]);
    return rows[0] ? toAuthUser(rows[0]) : null;
  }

  // The only query that reads the password hash
  async findCredentials(username: string, db: Queryable = pool): Promise<StoredUser | null> {
    const { rows } = await db.query(
      `SELECT ${AUTH_FIELDS}, password FROM users WHERE LOWER(username) = LOWER($1)`,
      [username],
    );
    if (!rows[0]) return null;
    return { ...toAuthUser(rows[0]), passwordHash: (rows[0].password as string | null) ?? null };
  }

  async usernameExists(username: string, db: Queryable = pool): Promise<boolean> {
    const { rows } = await db.query('SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    return rows.length > 0;
  }

  async emailExists(email: string, db: Queryable = pool): Promise<boolean> {
    const { rows } = await db.query('SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return rows.length > 0;
  }

  async create(user: NewUserRow, db: Queryable = pool): Promise<AuthUser> {
    const { rows } = await db.query(
      `INSERT INTO users (username, email, password, first_name, last_name, referral_code)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${AUTH_FIELDS}`,
      [
        user.username,
        user.email,
        user.passwordHash,
        user.firstName ?? '',
        user.lastName ?? '',
        user.referralCode || null,
      ],
    );
    return toAuthUser(requireRow(rows, 'INSERT INTO users'));
  }

  async findDetails(id: number, db: Queryable = pool): Promise<Omit<UserDetails, 'socials'> | null> {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ? toDetails(rows[0]) : null;
  }

  async update(id: number, changes: UserUpdate, db: Queryable = pool): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, column] of Object.entries(UPDATE_COLUMNS)) {
      const value = changes[key as keyof UserUpdate];
      if (value !== undefined) fields.push(`${column} = $${values.push(value)}`);
    }
    if (!fields.length) return;

    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${values.push(id)}`, values);
  }

  async setLineNotify(id: number, enabled: boolean, db: Queryable = pool): Promise<void> {
    await db.query('UPDATE users SET line_notify = $1 WHERE id = $2', [enabled, id]);
  }

  async referralCodeOf(id: number, db: Queryable = pool): Promise<string | null> {
    const { rows } = await db.query('SELECT referral_code FROM users WHERE id = $1', [id]);
    return (rows[0]?.referral_code as string | null | undefined) ?? null;
  }

  async displayName(id: number, db: Queryable = pool): Promise<string> {
    const { rows } = await db.query(
      `SELECT COALESCE(NULLIF(TRIM(first_name || ' ' || last_name), ''), username) AS name
       FROM users WHERE id = $1`,
      [id],
    );
    return (rows[0]?.name as string | undefined) ?? '';
  }
}

function toAuthUser(row: Row): AuthUser {
  return {
    id: row.id as number,
    username: row.username as string,
    role: (row.role as UserRole | undefined) ?? 'customer',
  };
}

function toDetails(row: Row): Omit<UserDetails, 'socials'> {
  return {
    id: row.id as number,
    username: row.username as string,
    email: (row.email as string | null) ?? '',
    first_name: row.first_name as string,
    last_name: row.last_name as string,
    is_staff: row.role === 'admin',
    extendeduser: {
      gender: (row.gender as string | null) ?? null,
      telephone: (row.telephone as string | null) ?? null,
      line: (row.line as string | null) ?? null,
      facebook: (row.facebook as string | null) ?? null,
      google: (row.google as string | null) ?? null,
      affiliateName: (row.affiliate_name as string | null) ?? null,
      birthDate: (row.birth_date as string | null) ?? null,
      referralCode: (row.referral_code as string | null) ?? null,
      billingAddressId: (row.billing_address_id as number | null) ?? null,
      shippingAddressId: (row.shipping_address_id as number | null) ?? null,
      has_consent: Boolean(row.has_consent),
      line_notify: Boolean(row.line_notify),
    },
  };
}
