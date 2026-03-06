"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Clock3, Filter, MapPin, Search } from "lucide-react";
import { listAuthorityIssues, type IssueListItem, updateIssueStatus } from "@/lib/api/issues";
import { toast } from "sonner";
import type { MapIssuePoint } from "@/features/shared/map/IssueMapClient";

const IssueMapClient = dynamic(() => import("@/features/shared/map/IssueMapClient"), {
  ssr: false,
  loading: () => <div className="h-130 w-full animate-pulse rounded-2xl bg-gray-100" />,
});

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

function formatIssueId(index: number, total: number) {
  const value = Math.max(total - index, 1);
  return `RPT-${String(value).padStart(3, "0")}`;
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
  return `${Math.floor(diff / (1000 * 60 * 60 * 24))}d`;
}

function asNumber(value?: number) {
  if (typeof value !== "number") return undefined;
  return Number.isFinite(value) ? value : undefined;
}

export default function AuthorityMapPage() {
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
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
        setError(err instanceof Error ? err.message : "Failed to load issues");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const mappableIssues = useMemo(() => {
    return issues.filter((issue) => {
      const lat = asNumber(issue.location?.latitude);
      const lng = asNumber(issue.location?.longitude);
      return lat !== undefined && lng !== undefined;
    });
  }, [issues]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return mappableIssues
      .filter((issue) => {
        if (statusFilter !== "all" && issue.status !== statusFilter) return false;
        if (!normalized) return true;
        const haystack = [
          issue.title,
          issue.location?.address,
          issue.location?.ward,
          issue.location?.municipality,
          issue.location?.district,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalized);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [mappableIssues, query, statusFilter]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedIssueId(null);
      return;
    }

    // Keep user-controlled selection only; do not auto-preselect on initial load.
    if (selectedIssueId && !filtered.some((issue) => issue.id === selectedIssueId)) {
      setSelectedIssueId(null);
    }
  }, [filtered, selectedIssueId]);

  const counts = useMemo(() => {
    const pending = mappableIssues.filter((issue) => issue.status === "pending").length;
    const inProgress = mappableIssues.filter((issue) => issue.status === "in_progress").length;
    const resolved = mappableIssues.filter((issue) => issue.status === "resolved").length;
    const rejected = mappableIssues.filter((issue) => issue.status === "rejected").length;
    return { pending, inProgress, resolved, rejected, total: mappableIssues.length };
  }, [mappableIssues]);

  const mapPoints: MapIssuePoint[] = useMemo(
    () =>
      filtered.map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        latitude: issue.location.latitude as number,
        longitude: issue.location.longitude as number,
        category: issue.category,
        locationLabel: formatLocation(issue),
      })),
    [filtered],
  );

  const onStatusChange = async (issueId: string, status: string) => {
    setUpdatingId(issueId);
    try {
      await updateIssueStatus(issueId, status);
      setIssues((prev) => prev.map((item) => (item.id === issueId ? { ...item, status } : item)));
      toast.success("Status updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Map View</h2>
        <p className="text-sm text-gray-500">Geographic view of all issues in your area</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search location..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-700 focus:border-blue-300 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={
                "rounded-full border px-2.5 py-1 " +
                (statusFilter === "all"
                  ? "border-blue-300 bg-blue-100 text-blue-700"
                  : "border-blue-200 bg-blue-50 text-blue-700")
              }
            >
              All Issues ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("resolved")}
              className={
                "rounded-full border px-2.5 py-1 " +
                (statusFilter === "resolved"
                  ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700")
              }
            >
              Resolved ({counts.resolved})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_progress")}
              className={
                "rounded-full border px-2.5 py-1 " +
                (statusFilter === "in_progress"
                  ? "border-amber-300 bg-amber-100 text-amber-700"
                  : "border-amber-200 bg-amber-50 text-amber-700")
              }
            >
              In Progress ({counts.inProgress})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={
                "rounded-full border px-2.5 py-1 " +
                (statusFilter === "pending"
                  ? "border-gray-300 bg-gray-100 text-gray-700"
                  : "border-gray-200 bg-gray-50 text-gray-700")
              }
            >
              Pending ({counts.pending})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("rejected")}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-600 hover:border-gray-300"
            >
              <Filter className="h-3.5 w-3.5" /> Rejected ({counts.rejected})
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading map data...</div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.8fr_0.9fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <IssueMapClient
              issues={mapPoints}
              selectedIssueId={selectedIssueId ?? undefined}
              onSelectIssue={(id) => setSelectedIssueId(id)}
              className="h-130 w-full overflow-hidden rounded-xl border border-gray-200"
              zoom={12}
              selectedZoom={17}
              showLegend
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-3 px-1 text-sm font-semibold text-gray-800">All Issues</div>
            <div className="max-h-130 space-y-3 overflow-y-auto pr-1">
              {filtered.length ? (
                filtered.map((issue, index) => {
                  const isSelected = selectedIssueId === issue.id;
                  const statusClass = STATUS_STYLES[issue.status] ?? "bg-gray-100 text-gray-700 border-gray-200";

                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={
                        "w-full rounded-xl border p-3 text-left transition " +
                        (isSelected
                          ? "border-blue-200 bg-blue-50/50"
                          : "border-gray-200 bg-white hover:border-gray-300")
                      }
                    >
                      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold">
                        <span className="text-blue-600">{formatIssueId(index, filtered.length)}</span>
                        <span className={`rounded-full border px-2 py-0.5 ${statusClass}`}>
                          {STATUS_LABELS[issue.status] ?? issue.status}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-gray-900">{issue.title}</div>
                      <div className="text-xs text-gray-500">{issue.category.replace(/_/g, " ")}</div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {formatLocation(issue)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" /> {formatDaysOpen(issue.createdAt)}
                        </span>
                      </div>

                      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5">
                        <select
                          value={issue.status}
                          onChange={(event) => onStatusChange(issue.id, event.target.value)}
                          disabled={updatingId === issue.id}
                          className="w-full bg-transparent text-xs font-semibold text-gray-700 outline-none"
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  No mapped issues found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
