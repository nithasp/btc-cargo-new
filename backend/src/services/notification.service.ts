import { config } from '../config';
import { logger } from '../logger';
import { Queryable } from '../types/database.types';
import { NewNotification, NotificationPage } from '../types/notification.types';
import { NotificationServiceDeps } from '../types/service.types';

const PAGE_SIZE = 10;
const UNREAD_PATH = '/api/notification/unread/';

const pageUrl = (page: number): string => `${config.publicUrl}${UNREAD_PATH}?page=${page}`;

export function createNotificationService({ notifications }: NotificationServiceDeps) {
  return {
    async listUnread(userId: number, page: number): Promise<NotificationPage> {
      const [data, count] = await Promise.all([
        notifications.listUnread(userId, PAGE_SIZE, (page - 1) * PAGE_SIZE),
        notifications.countUnread(userId),
      ]);
      return {
        data,
        page: {
          count,
          next: page * PAGE_SIZE < count ? pageUrl(page + 1) : null,
          previous: page > 1 ? pageUrl(page - 1) : null,
        },
      };
    },

    markAllRead(userId: number): Promise<void> {
      return notifications.markAllRead(userId);
    },

    notify(userId: number, entry: NewNotification, db?: Queryable): Promise<void> {
      return notifications.create(userId, entry, db);
    },

    notifyQuietly(userId: number, entry: NewNotification): void {
      notifications
        .create(userId, entry)
        .catch((err: unknown) => logger.warn({ err, userId }, 'could not save notification'));
    },
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
