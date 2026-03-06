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
      ? "w-64 bg-white border-r border-gray-200 h-[100dvh] sticky top-0 flex flex-col"
      : "w-full bg-white border-r border-gray-200 h-[100dvh] flex flex-col";

  const confirmLogout: React.FormEventHandler<HTMLFormElement> = (event) => {
    if (window.confirm("Are you sure you want to log out?")) return;
    event.preventDefault();
  };

  return (
    <aside className={asideClassName}>
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="logo" className="w-16 h-10 object-contain" />
          <div className="leading-tight">
            <div className="text-base font-semibold text-gray-900">Sajilo Fix</div>
            <div className="text-xs text-gray-500">Authority Portal</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all " +
                (isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")
              }
            >
              <span
                className={
                  "flex h-9 w-9 items-center justify-center rounded-lg border " +
                  (isActive ? "border-blue-100 bg-blue-100" : "border-gray-200 bg-white")
                }
              >
                <Icon className={"h-4 w-4 " + (isActive ? "text-blue-600" : "text-gray-500")} />
              </span>
              <span>{item.name}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                  {item.badge}
                </span>
              ) : null}
              <ChevronRight className="ml-auto h-4 w-4 text-gray-300" />
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <form action={handleLogout} onSubmit={confirmLogout} className="mt-1">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
