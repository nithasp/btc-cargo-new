import pool from '../database';
import { HtmlContent } from '../types/content.types';
import { Queryable, Row } from '../types/database.types';
import { NewNotification, NotificationItem } from '../types/notification.types';

const DEFAULT_ACTOR = 'BTC Cargo';

export class ContentRepository {
  async findByKey(key: string, db: Queryable = pool): Promise<HtmlContent | null> {
    const { rows } = await db.query<HtmlContent>(
      'SELECT id, key, html, plain FROM html_contents WHERE key = $1',
      [key],
    );
    return rows[0] ?? null;
  }
}

export class NotificationRepository {
  async listUnread(
    userId: number,
    limit: number,
    offset: number,
    db: Queryable = pool,
  ): Promise<NotificationItem[]> {
    const { rows } = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 AND unread
       ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return rows.map(toNotification);
  }

  async countUnread(userId: number, db: Queryable = pool): Promise<number> {
    const { rows } = await db.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND unread', [
      userId,
    ]);
    return Number(rows[0]?.count ?? 0);
  }

  async markAllRead(userId: number, db: Queryable = pool): Promise<void> {
    await db.query('UPDATE notifications SET unread = false WHERE user_id = $1 AND unread', [userId]);
  }

  async create(userId: number, entry: NewNotification, db: Queryable = pool): Promise<void> {
    await db.query(
      `INSERT INTO notifications (user_id, actor, title, message, link, link_text)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        entry.actor ?? DEFAULT_ACTOR,
        entry.title,
        entry.message,
        entry.link ?? '',
        entry.linkText ?? '',
      ],
    );
  }
}

function toNotification(row: Row): NotificationItem {
  return {
    unread: Boolean(row.unread),
    notification: {
      id: row.id as number,
      actor: row.actor as string,
      title: row.title as string,
      message: row.message as string,
      link: row.link as string,
      link_text: row.link_text as string,
      line_notify: '',
      timestamp: row.created_at as Date,
    },
  };
}
