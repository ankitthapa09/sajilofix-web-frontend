"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

type Props = {
  user: {
    fullName?: string;
    email?: string;
  };
};

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

  return {
    title: "Dashboard",
    subtitle: "Manage your platform effectively",
  };
}

export default function AdminTopbar({ user }: Props) {
  const pathname = usePathname() || "/admin";
  const header = headerForPath(pathname);

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{header.title}</h1>
          <p className="text-sm text-gray-500">{header.subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="bg-white border border-gray-200 px-3 py-2 rounded-md relative transition-all hover:-translate-y-[1px] hover:shadow-sm"
            aria-label="Notifications"
            type="button"
          >
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            <Bell className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold shadow-sm">
              {initialsFromName(user.fullName)}
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-gray-900">{user.fullName || "Admin User"}</div>
              <div className="text-sm text-gray-500">{user.email || ""}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
