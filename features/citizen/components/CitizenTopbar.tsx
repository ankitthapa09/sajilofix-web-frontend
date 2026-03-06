"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import NotificationBell from "@/features/shared/notifications/NotificationBell";

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
  if (!n) return "C";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "C";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

function headerForPath(pathname: string) {
  if (pathname.startsWith("/citizen/report-new-issue")) {
    return {
      title: "Report New Issue",
      subtitle: "Help us identify and resolve community issues.",
      showCta: false,
    };
  }

  if (pathname.startsWith("/citizen/reports")) {
    return {
      title: "My Reports",
      subtitle: "Track the status of your reported issues.",
      showCta: true,
    };
  }

  if (pathname.startsWith("/citizen/map")) {
    return {
      title: "Explore Map",
      subtitle: "Explore your reports geographically and track progress.",
      showCta: true,
    };
  }

  if (pathname.startsWith("/citizen/settings")) {
    return {
      title: "Settings",
      subtitle: "Manage your account, privacy, and notification preferences.",
      showCta: false,
    };
  }

  return {
    title: "Dashboard Overview",
    subtitle: "Welcome back! Here is whats happening with your reports.",
    showCta: true,
  };
}

export default function CitizenTopbar({ user, onMenuClick }: Props) {
  const pathname = usePathname() || "/citizen";
  const header = headerForPath(pathname);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
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
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{header.title}</h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{header.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {header.showCta ? (
            <Link
              href="/citizen/report-new-issue/category"
              className="hidden sm:inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Report New Issue
            </Link>
          ) : null}

          <NotificationBell />

          <div className="hidden sm:block h-8 w-px bg-gray-200" />

          <Link
            href="/citizen/settings"
            className="flex items-center gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-blue-50"
          >
            {resolveProfilePhotoUrl(user.profilePhoto) ? (
              <img
                src={resolveProfilePhotoUrl(user.profilePhoto)}
                alt={user.fullName || "Citizen"}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200 bg-white"
                loading="lazy"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center font-semibold shadow-sm">
                {initialsFromName(user.fullName)}
              </div>
            )}
            <div className="leading-tight hidden sm:block">
              <div className="font-semibold text-gray-900">{user.fullName || "Citizen User"}</div>
              <div className="text-sm text-gray-500">{user.email || ""}</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
