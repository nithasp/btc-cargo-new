import { Pool, types } from 'pg';
import { config } from './config';
import { logger } from './logger';
import { Tx } from './types/database.types';

// The frontend does arithmetic on amounts and dimensions, so NUMERIC and COUNT(*) must arrive as
// numbers, not as the strings node-postgres returns by default. DATE stays a plain YYYY-MM-DD
// string so a birth date is never shifted by the server's time zone.
types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));
types.setTypeParser(types.builtins.INT8, (value) => parseInt(value, 10));
types.setTypeParser(types.builtins.DATE, (value) => value);

const { url, host, port, name, user, password, sslMode, sslCa } = config.database;

// 'no-verify' accepts any certificate the server offers, which a provider with a self-signed
// certificate needs; it does not protect against a machine in the middle (OWASP API8)
const ssl =
  sslMode === 'off'
    ? false
    : sslMode === 'no-verify'
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: true, ...(sslCa ? { ca: sslCa } : {}) };

const pool = new Pool(
  url ? { connectionString: url, ssl } : { host, port, database: name, user, password, ssl },
);

pool.on('error', (err) => logger.error({ err }, 'idle database client error'));

export async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const tx = await pool.connect();
  try {
    await tx.query('BEGIN');
    const result = await fn(tx);
    await tx.query('COMMIT');
    return result;
  } catch (err) {
    await tx
      .query('ROLLBACK')
      .catch((rollbackErr: unknown) => logger.error({ err: rollbackErr }, 'rollback failed'));
    throw err;
  } finally {
    tx.release();
  }
}

export async function checkDatabase(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    logger.error({ err }, 'database health check failed');
    return false;
  }
}

export default pool;
