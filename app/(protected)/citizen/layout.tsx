import React from "react";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/cookie";
import CitizenShell from "@/features/citizen/components/CitizenShell";

export default async function CitizenLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const user = await getUserData();
	if (!user) redirect("/login");
	if (user.role === "admin") redirect("/admin");
	if (user.role === "authority") redirect("/authority");
	if (user.role !== "citizen") redirect("/login");

	return (
		<CitizenShell>{children}</CitizenShell>
	);
}
