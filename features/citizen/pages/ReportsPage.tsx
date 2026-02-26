"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { listIssueReports, type IssueListItem } from "@/lib/api/issues";

const CATEGORY_LABELS: Record<string, string> = {
  roads_potholes: "Roads & Potholes",
  electricity: "Electricity",
  water_supply: "Water Supply",
  waste_management: "Waste Management",
  street_lights: "Street Lights",
  public_infrastructure: "Public Infrastructure",
  others: "Others",
};

function formatCategory(value: string) {
  return CATEGORY_LABELS[value] ??
    value
      .replace(/[_-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
}

const URGENCY_STYLES: Record<string, { label: string; tone: string }> = {
  low: { label: "Low", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  medium: { label: "Medium", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  high: { label: "High", tone: "bg-orange-50 text-orange-700 border-orange-200" },
  urgent: { label: "Urgent", tone: "bg-rose-50 text-rose-700 border-rose-200" },
};

const STATUS_STYLES: Record<string, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "bg-gray-100 text-gray-700 border-gray-200" },
  in_progress: { label: "In Progress", tone: "bg-amber-100 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", tone: "bg-rose-100 text-rose-700 border-rose-200" },
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB");
}

function formatLocation(issue: IssueListItem) {
  if (issue.location?.address) return issue.location.address;
  const parts = [
    issue.location?.ward ? `Ward ${issue.location.ward}` : "",
    issue.location?.municipality,
    issue.location?.district,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
}

function formatReportId(index: number, total: number) {
  const value = Math.max(total - index, 1);
  return `RPT-${String(value).padStart(3, "0")}`;
}

export default function ReportsPage() {
  const [query, setQuery] = useState("");
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    listIssueReports()
      .then((data) => {
        if (!isMounted) return;
        setIssues(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load reports";
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const sorted = [...issues].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (!normalized) return sorted;

    return sorted.filter((issue) => {
      const haystack = [
        issue.title,
        issue.category,
        issue.location?.address,
        issue.location?.municipality,
        issue.location?.district,
        issue.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [issues, query]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Reports</h2>
            <p className="text-sm text-gray-500">View and manage all your submitted reports</p>
          </div>
          <Link
            href="/citizen/report-new-issue/category"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
          >
            + Report New Issue
          </Link>
        </div>

        <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reports..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 focus:border-blue-300 focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:border-gray-300"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
              Loading reports...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : filtered.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[880px] w-full text-left text-sm">
                <thead className="text-xs uppercase text-gray-400">
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-3">Report ID</th>
                    <th className="px-3 py-3">Title</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Engagement</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((issue, index) => {
                    const urgency = URGENCY_STYLES[issue.urgency] ?? {
                      label: issue.urgency,
                      tone: "bg-gray-100 text-gray-700 border-gray-200",
                    };
                    const status = STATUS_STYLES[issue.status] ?? {
                      label: issue.status,
                      tone: "bg-gray-100 text-gray-700 border-gray-200",
                    };

                    return (
                      <tr key={issue.id} className="text-gray-700">
                        <td className="px-3 py-3 text-emerald-600 font-semibold">
                          {formatReportId(index, filtered.length)}
                        </td>
                        <td className="px-3 py-3 font-medium text-gray-800">{issue.title}</td>
                        <td className="px-3 py-3 text-gray-600">{formatCategory(issue.category)}</td>
                        <td className="px-3 py-3 text-gray-600">{formatLocation(issue)}</td>
                        <td className="px-3 py-3 text-gray-500">{formatDate(issue.createdAt)}</td>
                        <td className="px-3 py-3 text-gray-400">--</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${urgency.tone}`}
                          >
                            {urgency.label}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.tone}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/citizen/reports/${issue.id}`}
                            className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
              No reports found. Submit your first issue to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
