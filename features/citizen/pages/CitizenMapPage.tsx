"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarDays, CircleDot, Eye, Filter, MapPin, Search, ThumbsUp } from "lucide-react";
import { listIssueReports, type IssueListItem } from "@/lib/api/issues";
import type { MapIssuePoint } from "@/features/shared/map/IssueMapClient";

const IssueMapClient = dynamic(() => import("@/features/shared/map/IssueMapClient"), {
  ssr: false,
  loading: () => <div className="h-136 w-full animate-pulse rounded-2xl bg-gray-100" />,
});

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const STATUS_CHIP_STYLES: Record<string, string> = {
  pending: "border-slate-200 bg-slate-50 text-slate-600",
  in_progress: "border-amber-200 bg-amber-50 text-amber-700",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_DOT_STYLES: Record<string, string> = {
  pending: "bg-slate-500",
  in_progress: "bg-orange-500",
  resolved: "bg-emerald-500",
  rejected: "bg-rose-500",
};

function asNumber(value?: number) {
  if (typeof value !== "number") return undefined;
  return Number.isFinite(value) ? value : undefined;
}

function formatLocation(issue: IssueListItem) {
  if (issue.location?.address) return issue.location.address;
  const parts = [
    issue.location?.ward ? `Ward ${issue.location.ward}` : "",
    issue.location?.municipality,
    issue.location?.district,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown location";
}

function formatIssueId(index: number, total: number) {
  const value = Math.max(total - index, 1);
  return `RPT-${String(value).padStart(3, "0")}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

export default function CitizenMapPage() {
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "Failed to load mapped reports");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const mappableIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const lat = asNumber(issue.location?.latitude);
        const lng = asNumber(issue.location?.longitude);
        return lat !== undefined && lng !== undefined;
      }),
    [issues]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return [...mappableIssues]
      .filter((issue) => {
        if (statusFilter !== "all" && issue.status !== statusFilter) return false;
        if (!normalized) return true;
        const haystack = [
          issue.title,
          issue.category,
          issue.location?.address,
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

  const counts = useMemo(() => {
    const pending = mappableIssues.filter((issue) => issue.status === "pending").length;
    const inProgress = mappableIssues.filter((issue) => issue.status === "in_progress").length;
    const resolved = mappableIssues.filter((issue) => issue.status === "resolved").length;
    return { pending, inProgress, resolved };
  }, [mappableIssues]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedIssueId(null);
      return;
    }

    if (!selectedIssueId || !filtered.some((issue) => issue.id === selectedIssueId)) {
      setSelectedIssueId(filtered[0].id);
    }
  }, [filtered, selectedIssueId]);

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
    [filtered]
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
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
                  ? "border-slate-300 bg-slate-100 text-slate-700"
                  : "border-slate-200 bg-slate-50 text-slate-700")
              }
            >
              Pending ({counts.pending})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-600 hover:border-gray-300"
            >
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Loading map data...</div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.85fr_0.95fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <IssueMapClient
              issues={mapPoints}
              selectedIssueId={selectedIssueId ?? undefined}
              onSelectIssue={(id) => setSelectedIssueId(id)}
              className="h-150 w-full overflow-hidden rounded-xl border border-gray-200"
              showLegend
            />
          </div>

          <div className="flex h-150 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Nearby Issues</h3>
              <span className="text-xs text-gray-500">{filtered.length} results</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {filtered.length ? (
                filtered.map((issue, index) => {
                  const isSelected = selectedIssueId === issue.id;
                  const chip = STATUS_CHIP_STYLES[issue.status] ?? "border-slate-200 bg-slate-50 text-slate-700";
                  const dot = STATUS_DOT_STYLES[issue.status] ?? "bg-slate-500";

                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={
                        "w-full rounded-xl border p-3 text-left transition " +
                        (isSelected
                          ? "border-blue-200 bg-blue-50/40"
                          : "border-gray-200 bg-white hover:border-gray-300")
                      }
                    >
                      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold">
                        <span className="text-emerald-600">{formatIssueId(index, filtered.length)}</span>
                        <span className={`rounded-full border px-2 py-0.5 ${chip}`}>{STATUS_LABELS[issue.status] ?? issue.status}</span>
                      </div>

                      <div className="line-clamp-2 text-sm font-semibold text-gray-900">{issue.title}</div>
                      <div className="text-xs text-gray-500">{issue.category.replace(/_/g, " ")}</div>

                      <div className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-500">
                        <div className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {formatLocation(issue)}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <CircleDot className={`h-3.5 w-3.5 ${dot}`} />
                          {STATUS_LABELS[issue.status] ?? issue.status}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> 0
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" /> 0
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(issue.createdAt)}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  No mapped reports found.
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Click on map markers to view issue details
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
