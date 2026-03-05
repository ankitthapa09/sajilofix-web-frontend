"use client";

import React from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  removeNotification,
  type NotificationItem,
} from "@/lib/api/notifications";

type Props = {
  buttonClassName?: string;
  panelClassName?: string;
  limit?: number;
};

function formatNotificationTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTypeLabel(type: NotificationItem["type"]) {
  if (type === "issue_created") return "Issue Created";
  if (type === "issue_status_changed") return "Status Updated";
  if (type === "issue_comment_added") return "Comment Added";
  return "Notification";
}

function unwrapMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatUnreadCountBadge(count: number) {
  if (count <= 0) return "";
  if (count > 99) return "99+";
  return String(count);
}

export default function NotificationBell({
  buttonClassName = "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-xs transition-all hover:-translate-y-px hover:border-gray-300 hover:shadow-sm",
  panelClassName = "absolute right-0 z-40 mt-2 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl",
  limit = 10,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const fetchLimit = Math.min(Math.max(1, limit), 10);

  const loadUnread = React.useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(Math.max(0, count));
    } catch {
    }
  }, []);

  const loadNotifications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listNotifications({ page: 1, limit: fetchLimit });
      setItems(data.items ?? []);
    } catch (error: unknown) {
      toast.error(unwrapMessage(error, "Failed to load notifications"));
    } finally {
      setIsLoading(false);
    }
  }, [fetchLimit]);

  React.useEffect(() => {
    void loadUnread();
  }, [loadUnread]);

  React.useEffect(() => {
    if (!open) return;
    void loadNotifications();
  }, [open, loadNotifications]);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const handleMarkOneRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: unknown) {
      toast.error(unwrapMessage(error, "Failed to mark notification as read"));
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error: unknown) {
      toast.error(unwrapMessage(error, "Failed to mark all notifications as read"));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleRemove = async (item: NotificationItem) => {
    try {
      await removeNotification(item._id);
      setItems((prev) => prev.filter((entry) => entry._id !== item._id));
      if (!item.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success("Notification removed");
    } catch (error: unknown) {
      toast.error(unwrapMessage(error, "Failed to remove notification"));
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        className={buttonClassName}
        onClick={() => setOpen((prev) => !prev)}
      >
        {unreadCount > 0 ? (
          <span className="pointer-events-none absolute -top-2 left-1/2 inline-flex h-4.5 min-w-4.5 -translate-x-1/2 items-center justify-center rounded-full border border-white bg-red-500 px-1 text-[9px] font-bold leading-none text-white shadow-sm">
            {formatUnreadCountBadge(unreadCount)}
          </span>
        ) : null}
        <Bell className="h-4.5 w-4.5 text-gray-700" strokeWidth={2.25} />
      </button>

      {open ? (
        <div className={panelClassName}>
          <div className="border-b border-gray-100 bg-linear-to-r from-slate-50 to-blue-50/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">Latest {fetchLimit} (including read)</p>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                {unreadCount} unread
              </span>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll || unreadCount === 0}
                className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">Loading notifications...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li
                    key={item._id}
                    className={
                      "group px-4 py-3 transition-colors " +
                      (item.isRead
                        ? "bg-white hover:bg-slate-50"
                        : "bg-blue-50/80 hover:bg-blue-100/70")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={
                            "text-xs font-semibold uppercase tracking-wide " +
                            (item.isRead ? "text-gray-400" : "text-blue-600")
                          }
                        >
                          {formatTypeLabel(item.type)}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-900 group-hover:text-gray-950">
                          {item.title}
                        </p>
                        <p className={"mt-1 text-sm " + (item.isRead ? "text-gray-600" : "text-gray-700")}>{item.message}</p>
                        <p className="mt-1 text-xs text-gray-400">{formatNotificationTime(item.createdAt)}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {!item.isRead ? (
                          <button
                            type="button"
                            onClick={() => handleMarkOneRead(item._id)}
                            className="rounded-md px-2 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                          >
                            Mark read
                          </button>
                        ) : (
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500">Read</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          aria-label="Remove notification"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:border-rose-200 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
