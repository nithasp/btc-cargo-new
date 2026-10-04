import supertest from 'supertest';
import app from '../../app';
import pool from '../../database';
import { seedCatalog } from '../../seeds/catalog';
import { seedContent } from '../../seeds/content';
import { seedMasterData } from '../../seeds/masterData';
import { VerificationKind } from '../../types/affiliate.types';
import { LOCATION } from '../../types/masterData.types';
import { TestUser } from '../../types/test.types';

export const ODOO = '/api/odoo';
export const ORIGIN = 'http://localhost:4200';

export const api = supertest(app);

export const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

let counter = 0;

export const uniqueName = (prefix = 'user'): string => {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter}`;
};

let referenceData: Promise<void> | null = null;

export function ensureReferenceData(): Promise<void> {
  referenceData ??= (async () => {
    await seedMasterData(pool);
    await seedContent(pool);
    await seedCatalog(pool);
  })();
  return referenceData;
}

export const refreshCookieOf = (res: supertest.Response): string => {
  const header = res.headers['set-cookie'] as unknown as string[] | undefined;
  return header?.[0]?.split(';')[0] ?? '';
};

export function clientFor(key: string) {
  const auth = (test: supertest.Test) => test.set('Authorization', `Token ${key}`);
  return {
    get: (url: string) => auth(api.get(url)),
    post: (url: string, body?: object) => auth(api.post(url)).send(body ?? {}),
    put: (url: string, body?: object) => auth(api.put(url)).send(body ?? {}),
    delete: (url: string) => auth(api.delete(url)),
    upload: (type = 'payment', file: Buffer = PNG, name = 'file.png') =>
      auth(api.post('/api/upload/')).field('type', type).attach('file', file, name),
  };
}

export async function registerUser(referralCode = ''): Promise<TestUser> {
  await ensureReferenceData();

  const username = uniqueName('u');
  const password = 'Str0ng!pass';
  const res = await api
    .post('/api/registration/')
    .send({
      username,
      email: `${username}@mail.test`,
      password1: password,
      password2: password,
      extendeduser: { referralCode },
    })
    .expect(201);

  const key = res.body.key as string;
  const client = clientFor(key);
  const me = await client.get('/api/user/').expect(200);
  return { id: me.body.id as number, username, password, key, cookie: refreshCookieOf(res), ...client };
}

export async function verify(userId: number, kind: VerificationKind): Promise<void> {
  await pool.query(
    "INSERT INTO verifications (user_id, kind, state, reviewed_at) VALUES ($1, $2, 'verified', NOW())",
    [userId, kind],
  );
}

export async function createLot(
  userId: number,
  options: { location?: number; pending?: boolean } = {},
): Promise<{ lotId: number; serial: string; total: number }> {
  const serial = uniqueName('SN').toUpperCase();
  const { rows } = await pool.query(
    `INSERT INTO lots
       (user_id, serial_number, shopping_serial, quantity, weight, width, depth, height, volume,
        total_weight, total_volume, delivery_cost, other_cost, th_other_cost, total_cost,
        current_location_id, confirm_state)
     VALUES ($1, $2, $3, 2, 5, 30, 40, 20, 0.024, 10, 0.048, 250, 40, 10, 300, $4, $5)
     RETURNING id`,
    [
      userId,
      `LOT-${serial}`,
      serial,
      options.location ?? LOCATION.TH_WAREHOUSE,
      options.pending ? 'pending' : 'none',
    ],
  );
  const lotId = rows[0]?.id as number;

  if (!options.pending) {
    await pool.query(
      'INSERT INTO china_trackings (user_id, shopping_serial, delivery_type_id, lot_id) VALUES ($1, $2, 1, $3)',
      [userId, serial, lotId],
    );
  }
  return { lotId, serial, total: 300 };
}

export async function creditWallet(userId: number, amount: number): Promise<number> {
  const { rows } = await pool.query(
    'UPDATE wallets SET credit_amount = $1 WHERE user_id = $2 AND active RETURNING id',
    [amount, userId],
  );
  return rows[0]?.id as number;
}

export const ADDRESS = {
  name: 'Home',
  person: 'Test Person',
  telephone: '0800000000',
  is_juristic: false,
  vat: '',
  address: '1 Test Road',
  district: '104101',
};

export const DELIVERY = {
  name: 'Test Person',
  phone_number: '0800000000',
  line1: '1 Test Road',
  line2: '104101',
};
