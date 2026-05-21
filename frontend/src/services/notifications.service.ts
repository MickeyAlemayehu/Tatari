import { api } from "../lib/api";
import type { Paginated } from "../types/api";

export interface NotificationRecord {
  id: number;
  title: string;
  message: string;
  type: string;
  category: string;
  timestamp?: string;
  read: boolean;
}

export const notificationsService = {
  list: (params?: { unread?: boolean; per_page?: number }) => {
    const query = new URLSearchParams();
    if (params?.unread) query.set("unread", "1");
    if (params?.per_page) query.set("per_page", String(params.per_page ?? 50));
    const qs = query.toString();
    return api.get<Paginated<NotificationRecord>>(`/notifications${qs ? `?${qs}` : ""}`);
  },

  unreadCount: () => api.get<{ unreadCount: number }>("/notifications/unread-count"),

  markRead: (id: number) => api.post<NotificationRecord>(`/notifications/${id}/read`),

  markAllRead: () => api.post<{ message: string; updated: number }>("/notifications/mark-all-read"),

  remove: (id: number) => api.delete<{ message: string }>(`/notifications/${id}`),

  clearRead: () => api.delete<{ message: string; deleted: number }>("/notifications/read"),
};
