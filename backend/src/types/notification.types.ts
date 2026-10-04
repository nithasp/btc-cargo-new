export interface NotificationItem {
  unread: boolean;
  notification: {
    id: number;
    actor: string;
    title: string;
    message: string;
    link: string;
    link_text: string;
    line_notify: string;
    timestamp: Date;
  };
}

export interface NewNotification {
  actor?: string | undefined;
  title: string;
  message: string;
  link?: string | undefined;
  linkText?: string | undefined;
}

export interface NotificationPage {
  data: NotificationItem[];
  page: { count: number; next: string | null; previous: string | null };
}
