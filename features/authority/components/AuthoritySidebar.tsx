"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  FolderKanban,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { handleLogout } from "@/lib/actions/auth-action";

const nav = [
  { name: "Overview", href: "/authority", icon: LayoutDashboard },
  { name: "Priority Queue", href: "/authority/priority", icon: AlertTriangle, badge: "1" },
  { name: "All Issues", href: "/authority/issues", icon: FolderKanban },
  { name: "Map View", href: "/authority/map", icon: MapPin },
  { name: "Analytics", href: "/authority/analytics", icon: BarChart3 },
  { name: "Settings", href: "/authority/settings", icon: Settings },
];

export default function AuthoritySidebar({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "/authority";
  const asideClassName =
    variant === "desktop"
      ? "w-64 bg-slate-50 border-r border-slate-200 h-[100dvh] sticky top-0 flex flex-col"
      : "w-full bg-slate-50 border-r border-slate-200 h-[100dvh] flex flex-col";

  const confirmLogout: React.FormEventHandler<HTMLFormElement> = (event) => {
    if (window.confirm("Are you sure you want to log out?")) return;
    event.preventDefault();
  };

  return (
    <aside className={asideClassName}>
      <div className="px-5 py-5 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="logo" className="w-16 h-10 object-contain" />
          <div className="leading-tight">
            <div className="text-base font-semibold text-slate-900">Sajilo Fix</div>
            <div className="text-xs text-slate-500">Authority Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const isOverview = item.href === "/authority";
          const isPriority = item.href === "/authority/priority";
          const isActive = isOverview
            ? pathname === "/authority"
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={
                "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 " +
                (isActive
                  ? isPriority
                    ? "border-red-100 bg-linear-to-r from-red-50 to-rose-50 text-red-700 shadow-sm"
                    : "border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                  : "border-transparent text-slate-600 hover:border-blue-100 hover:bg-blue-50/70 hover:text-blue-700")
              }
            >
              <span
                className={
                  "flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 " +
                  (isActive
                    ? isPriority
                      ? "border-red-100 bg-red-100"
                      : "border-blue-100 bg-blue-100"
                    : "border-slate-200 bg-white group-hover:border-blue-100 group-hover:bg-blue-50")
                }
              >
                <Icon
                  className={
                    "h-4 w-4 " +
                    (isActive
                      ? isPriority
                        ? "text-red-600"
                        : "text-blue-600"
                      : "text-slate-500 group-hover:text-blue-600")
                  }
                />
              </span>
              <span>{item.name}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                  {item.badge}
                </span>
              ) : null}
              <ChevronRight
                className={
                  "ml-auto h-4 w-4 transition-all duration-200 " +
                  (isActive
                    ? isPriority
                      ? "text-red-400"
                      : "text-blue-400"
                    : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-blue-400")
                }
              />
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <form action={handleLogout} onSubmit={confirmLogout} className="mt-1">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
