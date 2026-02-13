import React from "react";
import { redirect } from "next/navigation";

import { getUserData } from "@/lib/cookie";
import AdminShell from "@/features/admin/components/AdminShell";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUserData();
  if (!user) redirect("/admin/login");
  if (user.role === "authority") redirect("/authority");
  if (user.role === "citizen") redirect("/citizen");
  if (user.role !== "admin") redirect("/admin/login");

  return (
    <AdminShell
      user={{
        fullName: user.fullName,
        email: user.email,
        profilePhoto: typeof user.profilePhoto === "string" ? user.profilePhoto : undefined,
      }}
    >
      {children}
    </AdminShell>
  );
}
