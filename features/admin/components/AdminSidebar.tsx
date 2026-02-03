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
  { name: "Departments", href: "/admin/departments", icon: BarChart3 },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Announcements", href: "/admin#announcements", icon: Bell },
  { name: "Analytics", href: "/admin#analytics", icon: BarChart3 },
  { name: "Activity Logs", href: "/admin#activity", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="w-64 bg-gradient-to-b from-[#0B1020] via-[#0E1730] to-[#0B1020] h-screen sticky top-0 flex flex-col border-r border-white/5">
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="logo" className="w-7 h-7 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-white">Sajilo Fix</div>
            <div className="text-sm text-white/70">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="space-y-1.5 flex-1 px-4 py-5">
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
                  ? "bg-[#4F46E5] text-white shadow-[0_10px_30px_-14px_rgba(79,70,229,0.85)]"
                  : "text-white/70 hover:text-white hover:bg-white/5")
              }
            >
              <span
                className={
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 " +
                  (isActive
                    ? "bg-white/15"
                    : "bg-white/5 border border-white/10 group-hover:bg-white/10")
                }
              >
                <Icon
                  className={
                    "w-4 h-4 transition-colors duration-200 " +
                    (isActive ? "text-white" : "text-white/60 group-hover:text-white")
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
                      : "bg-white/5 text-white/80 border-white/15")
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

      <div className="mt-4 px-4 pb-6">
        <form action={handleLogout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-white/80 hover:text-white hover:bg-white/5"
          >
            <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm">⎋</span>
            <span className="font-medium">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
