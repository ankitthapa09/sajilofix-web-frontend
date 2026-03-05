"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { listAuthorityIssues, type IssueListItem } from "@/lib/api/issues";
import { listNotifications, type NotificationItem } from "@/lib/api/notifications";

const CATEGORY_LABELS: Record<string, string> = {
  roads_potholes: "Roads & Potholes",
  electricity: "Electricity",
  water_supply: "Water Supply",
  waste_management: "Waste Management",
  street_lights: "Street Lights",
  public_infrastructure: "Public Infrastructure",
  others: "Others",
};

const CATEGORY_TONES = ["bg-blue-500", "bg-emerald-500", "bg-cyan-500", "bg-amber-500", "bg-purple-500"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

function formatLocation(issue: IssueListItem) {
  const parts = [issue.location?.address, issue.location?.municipality, issue.location?.district].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location unavailable";
}

function formatDaysOpen(createdAt: string) {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "-";
  const diff = Math.max(Date.now() - created, 0);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${days} days open`;
}

function formatRelativeTime(value: string) {
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return "Just now";
  const diffMs = Math.max(Date.now() - ts, 0);
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function urgencyBadge(urgency: string) {
  if (urgency === "urgent") return "bg-rose-100 text-rose-700";
  if (urgency === "high") return "bg-orange-100 text-orange-700";
  return "bg-blue-100 text-blue-700";
}

function statusBadge(status: string) {
  if (status === "resolved") return "bg-emerald-100 text-emerald-700";
  if (status === "in_progress") return "bg-amber-100 text-amber-700";
  if (status === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-gray-100 text-gray-700";
}

function activityTone(type: NotificationItem["type"]) {
  if (type === "issue_created") return "bg-blue-50 text-blue-600";
  if (type === "issue_status_changed") return "bg-emerald-50 text-emerald-600";
  return "bg-purple-50 text-purple-600";
}

function activityIcon(type: NotificationItem["type"]) {
  if (type === "issue_created") return AlertTriangle;
  if (type === "issue_status_changed") return CheckCircle2;
  return BarChart3;
}

export default function AuthorityDashboardPage() {
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [activities, setActivities] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([listAuthorityIssues(), listNotifications({ page: 1, limit: 5 })])
      .then(([issueData, notificationData]) => {
        if (!isMounted) return;
        setIssues(issueData);
        setActivities(notificationData.items ?? []);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = issues.length;
    const pending = issues.filter((item) => item.status === "pending").length;
    const inProgress = issues.filter((item) => item.status === "in_progress").length;
    const resolved = issues.filter((item) => item.status === "resolved").length;
    const open = pending + inProgress;
    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
    return { total, pending, inProgress, resolved, open, resolutionRate };
  }, [issues]);

  const urgentIssue = useMemo(() => {
    return issues.find((item) => (item.urgency === "urgent" || item.urgency === "high") && item.status !== "resolved");
  }, [issues]);

  const categoryDistribution = useMemo(() => {
    if (!issues.length) return [] as Array<{ label: string; value: number; tone: string }>;
    const counts = new Map<string, number>();
    for (const issue of issues) {
      counts.set(issue.category, (counts.get(issue.category) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count], index) => ({
        label: CATEGORY_LABELS[key] ?? key,
        value: Math.round((count / issues.length) * 100),
        tone: CATEGORY_TONES[index % CATEGORY_TONES.length],
      }));
  }, [issues]);

  const recentIssues = useMemo(() => {
    return [...issues]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [issues]);

  const statCards = [
    {
      label: "Total Issues",
      value: String(metrics.total),
      note: "Across all categories",
      icon: FileText,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      label: "Pending Review",
      value: String(metrics.pending),
      note: "Needs first action",
      icon: Clock3,
      tone: "text-orange-600 bg-orange-50",
    },
    {
      label: "In Progress",
      value: String(metrics.inProgress),
      note: "Currently being worked",
      icon: BarChart3,
      tone: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Resolution Rate",
      value: `${metrics.resolutionRate}%`,
      note: `${metrics.resolved} resolved`,
      icon: CheckCircle2,
      tone: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Loading dashboard...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className={"flex h-10 w-10 items-center justify-center rounded-xl " + stat.tone}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="mt-4 text-2xl font-semibold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="mt-2 text-xs text-gray-500">{stat.note}</div>
                </div>
              );
            })}
          </div>

          {urgentIssue ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm font-semibold text-rose-700">
                  <AlertTriangle className="h-4 w-4" />
                  {metrics.open} open issues, including urgent items that need immediate attention
                </div>
                <Link
                  href="/authority/priority"
                  className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
                >
                  Review Priority Queue
                </Link>
              </div>
              <div className="mt-3 rounded-xl border border-rose-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                    {urgentIssue.urgency === "urgent" ? "Urgent" : "High"}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {STATUS_LABELS[urgentIssue.status] ?? urgentIssue.status}
                  </span>
                  <div className="text-sm font-semibold text-gray-900">{urgentIssue.title}</div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <div className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {formatLocation(urgentIssue)}
                  </div>
                  <div>{formatDaysOpen(urgentIssue.createdAt)}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="text-sm font-semibold text-gray-700">Performance Metrics</div>
                <span className="text-xs text-gray-400">Based on current issue data</span>
              </div>
              <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="text-xs text-blue-600">Total Open Issues</div>
                  <div className="mt-2 text-lg font-semibold text-gray-900">{metrics.open}</div>
                  <div className="text-xs text-gray-500">Pending + In Progress</div>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="text-xs text-emerald-600">Resolved Issues</div>
                  <div className="mt-2 text-lg font-semibold text-gray-900">{metrics.resolved}</div>
                  <div className="text-xs text-gray-500">{metrics.resolutionRate}% of total reports</div>
                </div>
                <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4">
                  <div className="text-xs text-purple-600">Recent Activities</div>
                  <div className="mt-2 text-lg font-semibold text-gray-900">{activities.length}</div>
                  <div className="text-xs text-gray-500">Latest notification events</div>
                </div>
              </div>
              <div className="border-t border-gray-100 px-5 py-4">
                <div className="text-xs font-semibold text-gray-500">Category Distribution</div>
                <div className="mt-3 space-y-3">
                  {categoryDistribution.length ? (
                    categoryDistribution.map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className={"h-2 rounded-full " + item.tone} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center text-xs text-gray-500">
                      No issue distribution available yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="text-sm font-semibold text-gray-700">Recent Activity</div>
              </div>
              <div className="space-y-4 px-5 py-4">
                {activities.length ? (
                  activities.slice(0, 4).map((item) => {
                    const Icon = activityIcon(item.type);
                    return (
                      <div key={item._id} className="flex gap-3">
                        <div className={"flex h-9 w-9 items-center justify-center rounded-lg " + activityTone(item.type)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold text-gray-800">{item.title}</div>
                          <div className="text-xs text-gray-500">{item.message}</div>
                          <div className="text-xs text-gray-400">{formatRelativeTime(item.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center text-xs text-gray-500">
                    No activity yet.
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100 px-5 py-3 text-right">
                <Link
                  href="/authority/issues"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All Activity <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="text-sm font-semibold text-gray-700">Recent Issues</div>
              <Link
                href="/authority/issues"
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3 px-5 py-4">
              {recentIssues.length ? (
                recentIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/authority/issues/${issue.id}`}
                    className="block rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + urgencyBadge(issue.urgency)}>
                        {issue.urgency === "urgent" ? "Urgent" : issue.urgency === "high" ? "High" : "Normal"}
                      </span>
                      <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + statusBadge(issue.status)}>
                        {STATUS_LABELS[issue.status] ?? issue.status}
                      </span>
                      <div className="text-sm font-semibold text-gray-900">{issue.title}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {formatLocation(issue)}
                      </div>
                      <div>{formatDaysOpen(issue.createdAt)}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  No issues reported yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
