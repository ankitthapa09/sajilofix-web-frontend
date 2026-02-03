"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import { handleLogout } from "@/lib/actions/auth-action";

const nav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, badge: "Preview" },
  { name: "User Management", href: "/admin/user-management", icon: Users },
  { name: "Issue Management", href: "/admin/issue-management", icon: FolderKanban },
  { name: "Departments", href: "/admin#departments", icon: BarChart3 },
  { name: "Categories", href: "/admin#categories", icon: Tags },
  { name: "Announcements", href: "/admin#announcements", icon: Bell },
  { name: "Analytics", href: "/admin#analytics", icon: BarChart3 },
  { name: "Activity Logs", href: "/admin#activity", icon: Activity },
  { name: "Settings", href: "/admin#settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 px-5 py-6 flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <img src="/logo.png" alt="logo" className="w-6 h-6 object-contain" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-gray-900">Sajilo Fix</div>
          <div className="text-sm text-gray-500">Admin Panel</div>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const baseHref = item.href.split("#")[0];
          const isActive = pathname === baseHref || pathname.startsWith(baseHref + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 " +
                (isActive
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-sm hover:-translate-y-[1px]")
              }
            >
              <span
                className={
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 " +
                  (isActive
                    ? "bg-white/15"
                    : "bg-gray-50 border border-gray-200 group-hover:bg-white")
                }
              >
                <Icon
                  className={
                    "w-4 h-4 transition-colors duration-200 " +
                    (isActive ? "text-white" : "text-gray-600 group-hover:text-emerald-700")
                  }
                />
              </span>
              <span className="font-medium">{item.name}</span>

              {item.badge ? (
                <span
                  className={
                    "ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold border " +
                    (isActive
                      ? "bg-white/15 text-white border-white/20"
                      : "bg-white text-emerald-700 border-emerald-200")
                  }
                >
                  {item.badge}
                </span>
              ) : null}

              <span
                className={
                  "ml-auto text-sm transition-all duration-200 " +
                  (isActive ? "opacity-90" : "opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5")
                }
              >
                ›
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        <form action={handleLogout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-gray-700 hover:bg-gray-50"
          >
            <span className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-sm">⎋</span>
            <span className="font-medium">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
