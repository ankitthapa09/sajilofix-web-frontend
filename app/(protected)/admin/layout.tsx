import React from "react";
import { redirect } from "next/navigation";
import { Bell, LogOut, Settings, Shield } from "lucide-react";

import { getUserData } from "@/lib/cookie";
import { handleLogout } from "@/lib/actions/auth-action";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUserData();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/citizen");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="text-lg font-semibold text-gray-900">Admin Dashboard</div>
              <div className="text-sm text-gray-500">Manage users and system</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>

            <button
              type="button"
              aria-label="Settings"
              className="w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>

            <form action={handleLogout}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 h-10 rounded-md border border-transparent bg-white hover:bg-gray-50 text-gray-700 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
