"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import NotificationBell from "@/features/shared/notifications/NotificationBell";
import { listAuthorityIssues } from "@/lib/api/issues";

type Props = {
  user: {
    fullName?: string;
    email?: string;
    profilePhoto?: string;
  };
  onMenuClick?: () => void;
};

function resolveProfilePhotoUrl(profilePhoto?: string) {
  const v = (profilePhoto ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
  const path = v.startsWith("/") ? v : `/${v}`;
  return `${base}${path}`;
}

function initialsFromName(name?: string) {
  const n = (name ?? "").trim();
  if (!n) return "A";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

export default function AuthorityTopbar({ user, onMenuClick }: Props) {
  const pathname = usePathname() || "/authority";
  const [pendingCount, setPendingCount] = React.useState<number | null>(null);

  const refreshPendingCount = React.useCallback(async () => {
    try {
      const issues = await listAuthorityIssues();
      setPendingCount(issues.filter((issue) => issue.status === "pending").length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  React.useEffect(() => {
    void refreshPendingCount();
  }, [refreshPendingCount, pathname]);

  React.useEffect(() => {
    const onIssuesUpdated = () => {
      void refreshPendingCount();
    };

    const onWindowFocus = () => {
      void refreshPendingCount();
    };

    window.addEventListener("authority:issues-updated", onIssuesUpdated);
    window.addEventListener("focus", onWindowFocus);

    return () => {
      window.removeEventListener("authority:issues-updated", onIssuesUpdated);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [refreshPendingCount]);

  const isPriorityPage = pathname === "/authority/priority" || pathname.startsWith("/authority/priority/");
  const pendingReminderLabel = `${pendingCount ?? 0} Pending Issue${pendingCount === 1 ? "" : "s"}`;

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {onMenuClick ? (
            <button
              type="button"
              aria-label="Open menu"
              onClick={onMenuClick}
              className="lg:hidden w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          ) : null}

          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 truncate">
              Monitor and manage civic issues across your jurisdiction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {!isPriorityPage ? (
            <div className="hidden sm:inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
              {pendingReminderLabel}
            </div>
          ) : null}

          <NotificationBell />

          <div className="hidden sm:block h-8 w-px bg-gray-200" />

          <Link href="/authority/settings" className="flex items-center gap-3 rounded-xl px-1.5 py-1 transition-colors hover:bg-gray-50">
            {resolveProfilePhotoUrl(user.profilePhoto) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveProfilePhotoUrl(user.profilePhoto)}
                alt={user.fullName || "Authority"}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200 bg-white"
                loading="lazy"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center font-semibold shadow-sm">
                {initialsFromName(user.fullName)}
              </div>
            )}
            <div className="leading-tight hidden sm:block">
              <div className="font-semibold text-gray-900">{user.fullName || "Authority User"}</div>
              <div className="text-sm text-gray-500">{user.email || ""}</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
