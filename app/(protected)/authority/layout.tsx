import React from "react";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/cookie";
import AuthorityShell from "@/features/authority/components/AuthorityShell";

export default async function AuthorityLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getUserData();
  if (!user) redirect("/authority/login");

  if (user.role === "admin") redirect("/admin");
  if (user.role === "citizen") redirect("/citizen");
  if (user.role !== "authority") redirect("/authority/login");

  return (
    <AuthorityShell
      user={{
        fullName: user.fullName,
        email: user.email,
        profilePhoto: typeof user.profilePhoto === "string" ? user.profilePhoto : undefined,
      }}
    >
      {children}
    </AuthorityShell>
  );
}
