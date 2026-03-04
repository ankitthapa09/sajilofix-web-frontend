"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Eye, X } from "lucide-react";
import { listAuthorityIssues, type IssueListItem } from "@/lib/api/issues";

const IssueMapClient = dynamic(() => import("@/features/shared/map/IssueMapClient"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl border border-gray-200 bg-gray-100" />,
});

function badgeForStatus(status: string) {
  if (status === "pending") return "bg-orange-100 text-orange-700";
  if (status === "in_progress") return "bg-blue-100 text-blue-700";
  if (status === "resolved") return "bg-emerald-100 text-emerald-700";
  return "bg-gray-100 text-gray-700";
}

function badgeForPriority(priority: string) {
  if (priority === "urgent") return "bg-red-100 text-red-700";
  if (priority === "high") return "bg-orange-100 text-orange-700";
  if (priority === "medium") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLocation(issue: IssueListItem) {
  const parts = [
    issue.location?.address,
    issue.location?.ward ? `Ward ${issue.location.ward}` : "",
    issue.location?.municipality,
    issue.location?.district,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
}

function StatCard({
  title,
  value,
  accent,
  badge,
}: {
  title: string;
  value: number;
  accent: string;
  badge?: string;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 border-l-4 ${accent}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
        </div>
        {badge ? (
          <span className="mt-0.5 inline-flex items-center rounded-full bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 text-[11px] font-semibold">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminIssueManagementPage() {
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueListItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    listAuthorityIssues()
      .then((data) => {
        if (!isMounted) return;
        setIssues(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load issues";
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

  useEffect(() => {
    if (!selectedIssue) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedIssue]);

  const stats = useMemo(() => {
    const total = issues.length;
    const pending = issues.filter((i) => i.status === "pending").length;
    const inProgress = issues.filter((i) => i.status === "in_progress").length;
    const resolved = issues.filter((i) => i.status === "resolved").length;
    return { total, pending, inProgress, resolved };
  }, [issues]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Issue Management</h2>
        <p className="text-sm text-gray-500">Monitor and manage all reported issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Issues" value={stats.total} accent="border-slate-400" />
        <StatCard title="Pending" value={stats.pending} accent="border-orange-500" />
        <StatCard title="In Progress" value={stats.inProgress} accent="border-blue-600" />
        <StatCard title="Resolved" value={stats.resolved} accent="border-emerald-500" />
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Loading issues...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-245 w-full text-sm">
              <thead className="bg-white text-gray-600 border-b border-gray-200">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Issue</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Reported By</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{issue.title}</td>
                    <td className="px-4 py-3 text-gray-700">{issue.category}</td>
                    <td className="px-4 py-3 text-gray-700">{formatLocation(issue)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeForPriority(issue.urgency)}`}>
                        {issue.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeForStatus(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{issue.reporterName || "Citizen"}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(issue.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          aria-label="View issue map"
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedIssue ? (
        <div className="fixed inset-0 z-80 bg-black/40 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
              <div>
                <div className="text-sm font-semibold text-gray-900">Issue Location Map</div>
                <div className="text-xs text-gray-500">{selectedIssue.title}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
                aria-label="Close map"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-4 sm:p-6">
              {typeof selectedIssue.location?.latitude === "number" && typeof selectedIssue.location?.longitude === "number" ? (
                <IssueMapClient
                  issues={[
                    {
                      id: selectedIssue.id,
                      title: selectedIssue.title,
                      status: selectedIssue.status,
                      category: selectedIssue.category,
                      latitude: selectedIssue.location.latitude,
                      longitude: selectedIssue.location.longitude,
                      locationLabel: formatLocation(selectedIssue),
                    },
                  ]}
                  selectedIssueId={selectedIssue.id}
                  center={[selectedIssue.location.latitude, selectedIssue.location.longitude]}
                  zoom={16}
                  className="h-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
                  Coordinates unavailable for this issue.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="h-10" />
    </div>
  );
}
