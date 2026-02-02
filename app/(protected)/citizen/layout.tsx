import React from "react";
import { redirect } from "next/navigation";
import CitizenSidebar from "../../../features/citizen/components/CitizenSidebar";
import { getUserData } from "@/lib/cookie";

export default async function CitizenLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const user = await getUserData();
	if (!user) redirect("/login");
	if (user.role === "admin") redirect("/admin");
	if (user.role === "authority") redirect("/authority");
	if (user.role !== "citizen") redirect("/login");

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="flex">
				<CitizenSidebar />
				<main className="flex-1 p-8">
					<header className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-4">
							<img src="/logo.png" alt="logo" className="w-8 h-8 object-contain" />
							<div>
								<h1 className="text-xl font-semibold">Dashboard Overview</h1>
								<p className="text-sm text-gray-500">Welcome back! Here is whats happening with your reports.</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<button className="bg-white border border-gray-200 px-3 py-2 rounded-md">🔔</button>
							<button className="bg-blue-600 text-white px-4 py-2 rounded-md">Report New Issue</button>
						</div>
					</header>

					<div>{children}</div>
				</main>
			</div>
		</div>
	);
}
