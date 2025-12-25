import { apiRequest } from "@/shared/api/query-client";

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  emailSent: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
};

export type NotificationPreferences = {
  id: string;
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  renewalReminders: boolean;
  renewalReminderDays: string;
  triggerRateAlerts: boolean;
  triggerRateThreshold: number;
  rateChangeAlerts: boolean;
  penaltyAlerts: boolean;
  blendExtendAlerts: boolean;
  updatedAt: string;
};

export const notificationApi = {
  getNotifications: (options?: { unreadOnly?: boolean; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (options?.unreadOnly) params.append("unreadOnly", "true");
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.offset) params.append("offset", String(options.offset));
    const queryString = params.toString();
    return apiRequest<Notification[]>(
      "GET",
      `/api/notifications${queryString ? `?${queryString}` : ""}`
    );
  },

  getUnreadCount: () => apiRequest<{ count: number }>("GET", "/api/notifications/unread-count"),

  markAsRead: (id: string) => apiRequest<{ success: boolean }>("PATCH", `/api/notifications/${id}/read`),

  markAllAsRead: () => apiRequest<{ count: number }>("PATCH", "/api/notifications/read-all"),

  deleteNotification: (id: string) => apiRequest<{ success: boolean }>("DELETE", `/api/notifications/${id}`),

  getPreferences: () => apiRequest<NotificationPreferences>("GET", "/api/notifications/preferences"),

  updatePreferences: (updates: Partial<NotificationPreferences>) =>
    apiRequest<NotificationPreferences>("PATCH", "/api/notifications/preferences", updates),
};

