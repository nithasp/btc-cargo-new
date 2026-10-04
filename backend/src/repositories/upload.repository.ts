import pool from '../database';
import { Queryable, Row } from '../types/database.types';
import { NewUpload, Upload } from '../types/upload.types';
import { requireRow } from '../utils/rows';

export class UploadRepository {
  async create(upload: NewUpload, db: Queryable = pool): Promise<Upload> {
    const { rows } = await db.query(
      `INSERT INTO uploads (user_id, storage_key, type, original_name, content_type, size)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [upload.userId, upload.storageKey, upload.type, upload.originalName, upload.contentType, upload.size],
    );
    return toUpload(requireRow(rows, 'INSERT INTO uploads'));
  }

  async listByUser(userId: number, db: Queryable = pool): Promise<Upload[]> {
    const { rows } = await db.query('SELECT * FROM uploads WHERE user_id = $1 ORDER BY id DESC LIMIT 200', [
      userId,
    ]);
    return rows.map(toUpload);
  }

  async findForUser(id: number, userId: number, db: Queryable = pool): Promise<Upload | null> {
    const { rows } = await db.query('SELECT * FROM uploads WHERE id = $1 AND user_id = $2', [id, userId]);
    return rows[0] ? toUpload(rows[0]) : null;
  }

  async findByKey(storageKey: string, db: Queryable = pool): Promise<Upload | null> {
    const { rows } = await db.query('SELECT * FROM uploads WHERE storage_key = $1', [storageKey]);
    return rows[0] ? toUpload(rows[0]) : null;
  }

  async replaceFile(
    id: number,
    file: Pick<NewUpload, 'storageKey' | 'originalName' | 'contentType' | 'size'>,
    db: Queryable = pool,
  ): Promise<Upload | null> {
    const { rows } = await db.query(
      `UPDATE uploads SET storage_key = $1, original_name = $2, content_type = $3, size = $4
       WHERE id = $5 RETURNING *`,
      [file.storageKey, file.originalName, file.contentType, file.size, id],
    );
    return rows[0] ? toUpload(rows[0]) : null;
  }

  async delete(id: number, db: Queryable = pool): Promise<void> {
    await db.query('DELETE FROM uploads WHERE id = $1', [id]);
  }
}

function toUpload(row: Row): Upload {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    storageKey: row.storage_key as string,
    type: row.type as string,
    originalName: row.original_name as string,
    contentType: row.content_type as string,
    size: row.size as number,
    createdAt: row.created_at as Date,
  };
}
