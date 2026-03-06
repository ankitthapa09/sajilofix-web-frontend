"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Eye, Filter, Search, ThumbsUp } from "lucide-react";
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
] as const;

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "resolved", label: "Resolved" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
] as const;

const STATUS_FILTER_STYLES: Record<
  StatusFilterValue,
  { active: string; inactive: string; countActive: string; countInactive: string }
> = {
  all: {
    active: "border-blue-300 bg-blue-100 text-blue-700",
    inactive: "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100/70",
    countActive: "bg-blue-200 text-blue-800",
    countInactive: "bg-blue-100 text-blue-700",
  },
  pending: {
    active: "border-gray-300 bg-gray-100 text-gray-700",
    inactive: "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100",
    countActive: "bg-gray-200 text-gray-800",
    countInactive: "bg-gray-100 text-gray-700",
  },
  in_progress: {
    active: "border-amber-300 bg-amber-100 text-amber-700",
    inactive: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100/70",
    countActive: "bg-amber-200 text-amber-800",
    countInactive: "bg-amber-100 text-amber-700",
  },
  resolved: {
    active: "border-emerald-300 bg-emerald-100 text-emerald-700",
    inactive: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100/70",
    countActive: "bg-emerald-200 text-emerald-800",
    countInactive: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    active: "border-slate-300 bg-slate-100 text-slate-700",
    inactive: "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70",
    countActive: "bg-slate-200 text-slate-800",
    countInactive: "bg-slate-100 text-slate-700",
  },
};

type StatusFilterValue = (typeof STATUS_FILTERS)[number]["value"];

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

function formatIssueId(index: number, total: number) {
  const value = Math.max(total - index, 1);
  return `RPT-${String(value).padStart(3, "0")}`;
}

export default function AuthorityIssuesPage() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const categoryMenuRef = React.useRef<HTMLDivElement | null>(null);

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
    if (!isCategoryMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!categoryMenuRef.current) return;
      if (categoryMenuRef.current.contains(event.target as Node)) return;
      setIsCategoryMenuOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCategoryMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isCategoryMenuOpen]);

  const statusCounts = useMemo(() => {
    return {
      all: issues.length,
      pending: issues.filter((issue) => issue.status === "pending").length,
      in_progress: issues.filter((issue) => issue.status === "in_progress").length,
      resolved: issues.filter((issue) => issue.status === "resolved").length,
      rejected: issues.filter((issue) => issue.status === "rejected").length,
    };
  }, [issues]);

  const categoryLabel = useMemo(() => {
    return CATEGORY_FILTERS.find((filter) => filter.value === categoryFilter)?.label ?? "All Categories";
  }, [categoryFilter]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const base = issues.filter((issue) => {
      if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
      if (statusFilter !== "all" && issue.status !== statusFilter) return false;

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
    return [...base].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [issues, query, categoryFilter, statusFilter]);

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
        <div className="border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Issues</h2>
            <p className="text-sm text-gray-500">Monitor and manage issues across your jurisdiction</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search issues..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 transition-colors focus:border-blue-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div ref={categoryMenuRef} className="relative w-full lg:w-80 lg:flex-none">
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
                className="inline-flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <span className="inline-flex items-center gap-2 truncate">
                  <Filter className="h-3.5 w-3.5" />
                  Category: {categoryLabel}
                </span>
                <ChevronDown className={"ml-3 h-4 w-4 text-gray-500 transition-transform " + (isCategoryMenuOpen ? "rotate-180" : "")} />
              </button>

              {isCategoryMenuOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {CATEGORY_FILTERS.map((filter) => (
                      <li key={filter.value}>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryFilter(filter.value);
                            setIsCategoryMenuOpen(false);
                          }}
                          className={
                            "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors " +
                            (categoryFilter === filter.value
                              ? "bg-blue-100 font-semibold text-blue-700"
                              : "text-gray-700 hover:bg-gray-50")
                          }
                        >
                          <span>{filter.label}</span>
                          {categoryFilter === filter.value ? <Check className="h-4 w-4" /> : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-100/70 p-3">
            <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.value;
              const count = statusCounts[filter.value];
              const styles = STATUS_FILTER_STYLES[filter.value];

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors " +
                    (isActive ? styles.active : styles.inactive)
                  }
                >
                  {filter.value === "rejected" ? <Filter className="h-3.5 w-3.5" /> : null}
                  <span>{filter.label === "All Status" ? "All Issues" : filter.label} ({count})</span>
                </button>
              );
            })}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
              Loading issues...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
          ) : filtered.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-275 w-full text-left text-sm">
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
                        <td className="px-3 py-3 text-blue-600 font-semibold">{formatIssueId(index, filtered.length)}</td>
                        <td className="px-3 py-3 font-medium text-gray-800">{issue.title}</td>
                        <td className="px-3 py-3 text-gray-600">{formatCategory(issue.category)}</td>
                        <td className="px-3 py-3 text-gray-600">{formatLocation(issue)}</td>
                        <td className="px-3 py-3 text-gray-600">{issue.reporterName ?? "-"}</td>
                        <td className="px-3 py-3 text-gray-500">{formatDaysOpen(issue.createdAt)}</td>
                        <td className="px-3 py-3 text-gray-500">
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" /> 0
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <ThumbsUp className="h-3.5 w-3.5" /> 0
                            </span>
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
                          <Link href={`/authority/issues/${issue.id}`} className="text-blue-600 text-sm font-semibold hover:text-blue-700">
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
