import pool from '../database';
import { Queryable, Row } from '../types/database.types';
import { SocialAccount, SocialProvider } from '../types/user.types';

export class SocialAccountRepository {
  async listByUser(userId: number, db: Queryable = pool): Promise<SocialAccount[]> {
    const { rows } = await db.query('SELECT * FROM social_accounts WHERE user_id = $1', [userId]);
    return rows.map(toSocialAccount);
  }

  async find(provider: SocialProvider, uid: string, db: Queryable = pool): Promise<SocialAccount | null> {
    const { rows } = await db.query('SELECT * FROM social_accounts WHERE provider = $1 AND uid = $2', [
      provider,
      uid,
    ]);
    return rows[0] ? toSocialAccount(rows[0]) : null;
  }

  async link(
    userId: number,
    provider: SocialProvider,
    uid: string,
    extraData: Record<string, unknown>,
    db: Queryable = pool,
  ): Promise<void> {
    await db.query(
      `INSERT INTO social_accounts (user_id, provider, uid, extra_data) VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, provider) DO UPDATE SET uid = EXCLUDED.uid, extra_data = EXCLUDED.extra_data`,
      [userId, provider, uid, JSON.stringify(extraData)],
    );
  }
}

function toSocialAccount(row: Row): SocialAccount {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    provider: row.provider as SocialProvider,
    uid: row.uid as string,
    extraData: (row.extra_data as Record<string, unknown> | null) ?? {},
  };
}
