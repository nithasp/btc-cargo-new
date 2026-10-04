import pool from '../database';
import { Verification, VerificationKind } from '../types/affiliate.types';
import { Queryable, Row } from '../types/database.types';
import { requireRow } from '../utils/rows';

export class VerificationRepository {
  async latest(userId: number, kind: VerificationKind, db: Queryable = pool): Promise<Verification | null> {
    const { rows } = await db.query(
      'SELECT * FROM verifications WHERE user_id = $1 AND kind = $2 ORDER BY id DESC LIMIT 1',
      [userId, kind],
    );
    return rows[0] ? toVerification(rows[0]) : null;
  }

  async create(userId: number, kind: VerificationKind, db: Queryable = pool): Promise<Verification> {
    const { rows } = await db.query('INSERT INTO verifications (user_id, kind) VALUES ($1, $2) RETURNING *', [
      userId,
      kind,
    ]);
    return toVerification(requireRow(rows, 'INSERT INTO verifications'));
  }

  async addImage(
    verificationId: number,
    uploadId: number,
    category: string,
    db: Queryable = pool,
  ): Promise<number> {
    const { rows } = await db.query(
      `INSERT INTO verification_images (verification_id, upload_id, image_category)
       VALUES ($1, $2, $3) RETURNING id`,
      [verificationId, uploadId, category],
    );
    return requireRow(rows, 'INSERT INTO verification_images').id as number;
  }

  // Conditional on the current state, so two requests racing to approve notify only once
  async approve(id: number, db: Queryable = pool): Promise<boolean> {
    const { rowCount } = await db.query(
      `UPDATE verifications SET state = 'verified', reviewed_at = NOW()
       WHERE id = $1 AND state = 'reviewing'`,
      [id],
    );
    return (rowCount ?? 0) > 0;
  }
}

function toVerification(row: Row): Verification {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    kind: row.kind as VerificationKind,
    state: row.state as Verification['state'],
    createdAt: row.created_at as Date,
  };
}
