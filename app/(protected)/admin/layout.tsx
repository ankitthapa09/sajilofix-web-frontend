import React from "react";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";

import { getUserData } from "@/lib/cookie";
import AdminSidebar from "@/features/admin/components/AdminSidebar";

function initialsFromName(name?: string) {
  const n = (name ?? "").trim();
  if (!n) return "A";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUserData();
  if (!user) redirect("/admin/login");
  if (user.role === "authority") redirect("/authority");
  if (user.role === "citizen") redirect("/citizen");
  if (user.role !== "admin") redirect("/admin/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1">
          <header className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your platform effectively</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  className="bg-white border border-gray-200 px-3 py-2 rounded-md relative transition-all hover:-translate-y-[1px] hover:shadow-sm"
                  aria-label="Notifications"
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

          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
