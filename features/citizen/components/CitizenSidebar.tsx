"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleLogout } from "@/lib/actions/auth-action";

const nav = [
  { name: "Overview", href: "/citizen", icon: "home" },
  { name: "My Reports", href: "/citizen/reports", icon: "file" },
  { name: "Analytics", href: "/citizen/analytics", icon: "chart" },
  { name: "Explore Map", href: "/citizen/map", icon: "map" },
  { name: "Settings", href: "/citizen/settings", icon: "cog" },
];

export default function CitizenSidebar({
  variant = "desktop",
  onNavigate,
  userStatus,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  userStatus?: string;
}) {
  const pathname = usePathname() || "/";
  return <CitizenSidebarInner pathname={pathname} variant={variant} onNavigate={onNavigate} userStatus={userStatus} />;
}

function CitizenSidebarInner({
  pathname,
  variant = "desktop",
  onNavigate,
  userStatus,
}: {
  pathname: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  userStatus?: string;
}) {
  const asideClassName =
    variant === "desktop"
      ? "w-64 bg-white border-r border-gray-200 h-screen sticky top-0 px-4 py-6 flex flex-col"
      : "w-full bg-white border-r border-gray-200 h-full px-4 py-6 flex flex-col";

  return (
    <aside className={asideClassName}>
      <div className="flex items-center gap-3 mb-8">
        <img src="/logo.png" alt="logo" className="w-20 h-12 object-contain" />
        <div>
          <div className="font-semibold text-blue-700">SajiloFix</div>
          <div className="text-sm text-gray-500">Citizen Portal</div>
          <div className="mt-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                (userStatus ?? "").toLowerCase() === "suspended"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              Status: {(userStatus ?? "active").toLowerCase() === "suspended" ? "Suspended" : "Active"}
            </span>
          </div>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {nav.map((item) => {
          const isOverview = item.href === "/citizen";
          const isActive = isOverview
            ? pathname === "/citizen"
            : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 ${
                isActive
                  ? "border-blue-100 bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                  : "border-transparent text-gray-700 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm"
              }`}
            >
              <span
                className={`w-6 h-6 flex items-center justify-center text-sm transition-transform duration-200 ${
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600 group-hover:scale-110"
                }`}
              >
                ●
              </span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        <form action={handleLogout} className="">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent transition-all duration-200 text-gray-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:shadow-sm"
          >
            <span className="w-6 h-6 flex items-center justify-center text-sm">⎋</span>
            <span className="font-medium">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

