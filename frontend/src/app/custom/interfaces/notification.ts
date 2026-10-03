export interface NotificationApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  page: NotificationPagination;
}

export interface NotificationData {
  concat(data: NotificationData);
  unread: boolean;
  notification: {
    actor: string;
    id: number;
    line_notify: string;
    link: string;
    link_text: string;
    message: string;
    timestamp: string;
    title: string;
  };
}

interface NotificationPagination {
  count: number;
  next?: string;
  previous?: string;
}
