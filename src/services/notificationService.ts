import { api } from "@/src/lib/api";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationListResponse {
  items: Notification[];
  meta: NotificationMeta;
}

export interface FetchNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export const notificationService = {
  async fetchAll(params: FetchNotificationsParams = {}): Promise<NotificationListResponse> {
    const res = await api.get<NotificationListResponse>("/notifications", { params });
    return res.data;
  },

  /** Cheap scalar query — only fetches the count, not full notification rows */
  async fetchUnreadCount(): Promise<number> {
    const res = await api.get<{ count: number }>("/notifications/unread-count");
    return res.data.count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const res = await api.patch<Notification>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<{ updated: number }> {
    const res = await api.patch<{ updated: number }>("/notifications/read-all");
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};

