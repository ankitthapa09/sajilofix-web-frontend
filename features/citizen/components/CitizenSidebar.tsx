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

export default function CitizenSidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 px-4 py-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <img src="/logo.png" alt="logo" className="w-10 h-10 object-contain" />
        <div>
          <div className="font-semibold text-blue-700">SajiloFix</div>
          <div className="text-sm text-gray-500">Citizen Portal</div>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {nav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="w-6 h-6 flex items-center justify-center text-sm">●</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4">
        <form action={handleLogout} className="">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-gray-700 hover:bg-gray-50"
          >
            <span className="w-6 h-6 flex items-center justify-center text-sm">⎋</span>
            <span className="font-medium">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
