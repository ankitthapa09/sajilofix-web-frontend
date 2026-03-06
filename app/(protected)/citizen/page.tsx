import DashboardPage from "@/features/citizen/pages/DashboardPage";
import { getUserData } from "@/lib/cookie";

export default async function CitizenDashboard() {
  const user = await getUserData();
  const fullName = typeof user?.fullName === "string" ? user.fullName : "";

  return <DashboardPage initialViewerName={fullName} />;
}