import React from "react";
import { redirect } from "next/navigation";

import { getUserData } from "@/lib/cookie";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AdminTopbar from "@/features/admin/components/AdminTopbar";

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
          <AdminTopbar user={{ fullName: user.fullName, email: user.email }} />

          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
