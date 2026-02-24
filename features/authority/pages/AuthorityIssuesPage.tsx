"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Filter, Search, ThumbsUp } from "lucide-react";
import { listAuthorityIssues, updateIssueStatus, type IssueListItem } from "@/lib/api/issues";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  roads_potholes: "Roads & Potholes",
  electricity: "Electricity",
  water_supply: "Water Supply",
  waste_management: "Waste Management",
  street_lights: "Street Lights",
  public_infrastructure: "Public Infrastructure",
  others: "Others",
};

const URGENCY_STYLES: Record<string, string> = {
  low: "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  urgent: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
};

const CATEGORY_FILTERS = [
  { value: "all", label: "All Categories" },
  { value: "roads_potholes", label: "Roads & Potholes" },
  { value: "electricity", label: "Electricity" },
  { value: "water_supply", label: "Water Supply" },
  { value: "waste_management", label: "Waste Management" },
  { value: "street_lights", label: "Street Lights" },
  { value: "public_infrastructure", label: "Public Infrastructure" },
  { value: "others", label: "Others" },
];

function formatCategory(value: string) {
  return CATEGORY_LABELS[value] ?? value;
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

function formatDaysOpen(createdAt: string) {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "-";
  const diff = Math.max(Date.now() - created, 0);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${days}d`;
}

function formatIssueId(index: number) {
  return `RPT-${String(index + 1).padStart(3, "0")}`;
}

export default function AuthorityIssuesPage() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return issues.filter((issue) => {
      if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;

      if (!normalized) return true;
      const haystack = [
        issue.title,
        issue.category,
        issue.location?.address,
        issue.location?.municipality,
        issue.location?.district,
        issue.reporterName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [issues, query, categoryFilter]);

  const onStatusChange = async (issueId: string, status: string) => {
    setUpdatingId(issueId);
    try {
      await updateIssueStatus(issueId, status);
      setIssues((prev) => prev.map((item) => (item.id === issueId ? { ...item, status } : item)));
      toast.success("Status updated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Issues</h2>
            <p className="text-sm text-gray-500">Monitor and manage issues across your jurisdiction</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setCategoryFilter(filter.value)}
                className={
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-all " +
                  (categoryFilter === filter.value
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50")
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search issues..."
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
              Loading issues...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : filtered.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left text-sm">
                <thead className="text-xs uppercase text-gray-400">
                  <tr className="border-b border-gray-100">
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Title</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Reporter</th>
                    <th className="px-3 py-3">Days Open</th>
                    <th className="px-3 py-3">Engagement</th>
                    <th className="px-3 py-3">Priority</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((issue, index) => {
                    const urgencyClass = URGENCY_STYLES[issue.urgency] ?? "bg-gray-100 text-gray-700 border-gray-200";
                    const statusClass = STATUS_STYLES[issue.status] ?? "bg-gray-100 text-gray-700 border-gray-200";
                    const urgencyLabel = issue.urgency ? issue.urgency.replace(/_/g, " ") : "";

                    return (
                      <tr key={issue.id} className="text-gray-700">
                        <td className="px-3 py-3 text-blue-600 font-semibold">{formatIssueId(index)}</td>
                        <td className="px-3 py-3 font-medium text-gray-800">{issue.title}</td>
                        <td className="px-3 py-3 text-gray-600">{formatCategory(issue.category)}</td>
                        <td className="px-3 py-3 text-gray-600">{formatLocation(issue)}</td>
                        <td className="px-3 py-3 text-gray-600">{issue.reporterName ?? "-"}</td>
                        <td className="px-3 py-3 text-gray-500">{formatDaysOpen(issue.createdAt)}</td>
                        <td className="px-3 py-3 text-gray-500">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> 0</span>
                            <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> 0</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${urgencyClass}`}>
                            {urgencyLabel || issue.urgency}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className={`inline-flex items-center rounded-full border px-2 py-1 ${statusClass}`}>
                            <select
                              value={issue.status}
                              onChange={(event) => onStatusChange(issue.id, event.target.value)}
                              disabled={updatingId === issue.id}
                              className="bg-transparent text-xs font-semibold outline-none"
                            >
                              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/authority/issues/${issue.id}`}
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
              No issues found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
