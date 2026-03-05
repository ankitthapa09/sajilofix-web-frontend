import { apiClient } from "./axios";
import { API_ENDPOINTS } from "./endpoints";

export type NotificationRecipientRole = "admin" | "authority" | "citizen";
export type NotificationType = "issue_created" | "issue_status_changed" | "issue_comment_added" | "system";
export type NotificationEntityType = "issue" | "comment" | "system";

export type NotificationItem = {
  _id: string;
  recipientUserId: string;
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  entityType: NotificationEntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ListNotificationsParams = {
  page?: number;
  limit?: number;
  isRead?: boolean;
};

export type ListNotificationsResult = {
  items: NotificationItem[];
  total: number;
  page: number;
  limit: number;
};

function unwrapError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

export async function listNotifications(params?: ListNotificationsParams): Promise<ListNotificationsResult> {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.notifications.list, {
      params,
    });
    return (resp.data?.data ?? { items: [], total: 0, page: 1, limit: params?.limit ?? 20 }) as ListNotificationsResult;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load notifications"));
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.notifications.unreadCount);
    return Number(resp.data?.data?.unreadCount ?? 0);
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load unread notification count"));
  }
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  try {
    const resp = await apiClient.patch(API_ENDPOINTS.notifications.markRead(id));
    return resp.data?.data as NotificationItem;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to mark notification as read"));
  }
}

export async function markAllNotificationsRead(): Promise<number> {
  try {
    const resp = await apiClient.patch(API_ENDPOINTS.notifications.markAllRead);
    return Number(resp.data?.data?.modifiedCount ?? 0);
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to mark all notifications as read"));
  }
}
