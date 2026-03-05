"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";

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

function headerForPath(pathname: string) {
  if (pathname.startsWith("/admin/user-management")) {
    return {
      title: "User Management",
      subtitle: "Manage your platform effectively",
    };
  }

  if (pathname.startsWith("/admin/issue-management")) {
    return {
      title: "Issue Management",
      subtitle: "Manage your platform effectively",
    };
  }

  if (pathname.startsWith("/admin/departments")) {
    return {
      title: "Departments",
      subtitle: "Manage your platform effectively",
    };
  }

  if (pathname.startsWith("/admin/categories")) {
    return {
      title: "Categories",
      subtitle: "Manage your platform effectively",
    };
  }

  if (pathname.startsWith("/admin/settings")) {
    return {
      title: "Settings",
      subtitle: "Manage your platform effectively",
    };
  }

  return {
    title: "Dashboard",
    subtitle: "Manage your platform effectively",
  };
}

export default function AdminTopbar({ user, onMenuClick }: Props) {
  const pathname = usePathname() || "/admin";
  const header = headerForPath(pathname);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
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
            <h1 className="text-lg font-semibold text-gray-900 truncate">{header.title}</h1>
            <p className="text-sm text-gray-500 truncate">{header.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="bg-white border border-gray-200 px-3 py-2 rounded-lg relative transition-all hover:-translate-y-px hover:shadow-sm"
            aria-label="Notifications"
            type="button"
          >
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            <Bell className="w-5 h-5 text-gray-700" />
          </button>

          <div className="hidden sm:block h-8 w-px bg-gray-200" />

          <div className="flex items-center gap-3">
            {resolveProfilePhotoUrl(user.profilePhoto) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveProfilePhotoUrl(user.profilePhoto)}
                alt={user.fullName || "Admin"}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200 bg-white"
                loading="lazy"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-semibold shadow-sm">
                {initialsFromName(user.fullName)}
              </div>
            )}
            <div className="leading-tight hidden sm:block">
              <div className="font-semibold text-gray-900">{user.fullName || "Admin User"}</div>
              <div className="text-sm text-gray-500">{user.email || ""}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
