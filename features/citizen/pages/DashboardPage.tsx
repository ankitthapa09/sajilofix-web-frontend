"use client";

import React from "react";
import { BellRing, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";
import StatCard from "../components/StatCard";
import RecentActivity, { type ActivityItem } from "../components/RecentActivity";
import { listIssueReports, type IssueListItem } from "@/lib/api/issues";
import { getUnreadNotificationCount, listNotifications } from "@/lib/api/notifications";
import { usersGetMe } from "@/lib/api/users";

function getStatusCounts(issues: IssueListItem[]) {
  return issues.reduce(
    (acc, issue) => {
      if (issue.status === "pending") acc.pending += 1;
      else if (issue.status === "in_progress") acc.inProgress += 1;
      else if (issue.status === "resolved") acc.resolved += 1;
      else if (issue.status === "rejected") acc.rejected += 1;
      return acc;
    },
    { pending: 0, inProgress: 0, resolved: 0, rejected: 0 }
  );
}

function toRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function averageResponseDays(issues: IssueListItem[]) {
  const durations = issues
    .map((issue) => {
      if (!issue.statusUpdatedAt) return null;
      const start = new Date(issue.createdAt).getTime();
      const end = new Date(issue.statusUpdatedAt).getTime();
      if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
      return (end - start) / (1000 * 60 * 60 * 24);
    })
    .filter((value): value is number => typeof value === "number");

  if (!durations.length) return null;
  const sum = durations.reduce((acc, days) => acc + days, 0);
  return sum / durations.length;
}

function formatToday(date: Date) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekday = weekdays[date.getDay()] ?? "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()] ?? "";
  const year = date.getFullYear();

  return `${weekday}, ${day} ${month} ${year}`;
}

function resolveGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

type DashboardPageProps = {
  initialViewerName?: string;
};

const DashboardPage = ({ initialViewerName = "" }: DashboardPageProps) => {
  const [issues, setIssues] = React.useState<IssueListItem[]>([]);
  const [activityItems, setActivityItems] = React.useState<ActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewerName, setViewerName] = React.useState((initialViewerName || "Citizen").trim());
  const [greetingInfo, setGreetingInfo] = React.useState({ greeting: "Welcome", today: "" });

  React.useEffect(() => {
    const now = new Date();
    setGreetingInfo({
      greeting: resolveGreeting(now.getHours()),
      today: formatToday(now),
    });
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [issuesData, notificationsData, unread, me] = await Promise.all([
          listIssueReports(),
          listNotifications({ page: 1, limit: 6 }),
          getUnreadNotificationCount(),
          usersGetMe(),
        ]);

        if (!isMounted) return;

        setIssues(issuesData);
        setUnreadCount(unread);
        setActivityItems(
          (notificationsData.items ?? []).map((item) => ({
            id: item._id,
            title: item.message || item.title,
            time: toRelativeTime(item.createdAt),
            unread: !item.isRead,
          }))
        );
        const name = (me.user?.fullName ?? "").trim();
        setViewerName(name || initialViewerName.trim() || "Citizen");
        setError(null);
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [initialViewerName]);

  const stats = React.useMemo(() => {
    const total = issues.length;
    const thisMonth = issues.filter((issue) => {
      const date = new Date(issue.createdAt);
      if (Number.isNaN(date.getTime())) return false;
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    const counts = getStatusCounts(issues);
    const openReports = counts.pending + counts.inProgress;
    const resolutionRate = total ? Math.round((counts.resolved / total) * 100) : 0;
    const avgResponse = averageResponseDays(issues);

    return {
      total,
      thisMonth,
      openReports,
      resolved: counts.resolved,
      resolutionRate,
      pending: counts.pending,
      inProgress: counts.inProgress,
      rejected: counts.rejected,
      avgResponse,
    };
  }, [issues]);

  const greeting = greetingInfo.greeting;
  const today = greetingInfo.today;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50 via-indigo-50 to-sky-50 p-5 shadow-sm">
        <div className="text-2xl font-semibold text-gray-900">
          {greeting}, {viewerName}
        </div>
        <div className="mt-1 text-sm text-gray-600">{today || " "}</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Reports"
          value={stats.total}
          subtitle={`${stats.thisMonth} created this month`}
          icon={<ClipboardList className="h-5 w-5" />}
          trend={stats.thisMonth > 0 ? `+${stats.thisMonth} this month` : "No new reports"}
          tone="blue"
        />
        <StatCard
          title="Open Reports"
          value={stats.openReports}
          subtitle={`${stats.pending} pending · ${stats.inProgress} in progress`}
          icon={<Clock3 className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          title="Resolved Reports"
          value={stats.resolved}
          subtitle={stats.total ? `${stats.resolutionRate}% resolution rate` : "No reports yet"}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={stats.rejected > 0 ? `${stats.rejected} rejected` : "All clean"}
          tone="emerald"
        />
        <StatCard
          title="Unread Notifications"
          value={unreadCount}
          subtitle="Latest updates from your reports"
          icon={<BellRing className="h-5 w-5" />}
          tone="violet"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Report Status Overview</h3>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-linear-to-br from-slate-50 to-gray-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="text-sm text-gray-500">Pending Review</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">{stats.pending}</div>
              </div>
              <div className="rounded-xl border border-blue-100 bg-linear-to-br from-blue-50 to-indigo-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="text-sm text-blue-600">In Progress</div>
                <div className="mt-2 text-2xl font-semibold text-blue-900">{stats.inProgress}</div>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-teal-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                <div className="text-sm text-emerald-600">Resolved</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-900">{stats.resolved}</div>
              </div>
            </div>

            <div className="rounded-xl border border-violet-100 bg-linear-to-r from-violet-50 to-fuchsia-50 p-4 text-sm text-violet-700 transition-colors hover:from-violet-100 hover:to-fuchsia-100">
              Average Response Time:{" "}
              {typeof stats.avgResponse === "number"
                ? `${stats.avgResponse.toFixed(1)} days`
                : "Not enough status updates yet"}
            </div>

            {isLoading ? (
              <div className="mt-4 text-sm text-gray-500">Refreshing dashboard...</div>
            ) : null}
          </div>
        </div>

        <div>
          <RecentActivity items={activityItems} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
 