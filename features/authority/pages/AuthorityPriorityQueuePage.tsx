"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Filter, MapPin, Search, User } from "lucide-react";
import { listPriorityIssues, type IssueListItem } from "@/lib/api/issues";
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
  urgent: "bg-rose-100 text-rose-700 border-rose-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
};

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
  return `${days} days open`;
}

function formatIssueId(index: number, total: number) {
  const value = Math.max(total - index, 1);
  return `RPT-${String(value).padStart(3, "0")}`;
}

export default function AuthorityPriorityQueuePage() {
  const [query, setQuery] = useState("");
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    listPriorityIssues()
      .then((data) => {
        if (!isMounted) return;
        setIssues(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load priority issues";
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
    if (!normalized) return issues;

    return issues.filter((issue) => {
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
  }, [issues, query]);

  const pendingCount = useMemo(() => {
    return issues.filter((issue) => issue.status === "pending").length;
  }, [issues]);

  const handleAssign = () => {
    toast.info("Assign flow is coming soon.");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Priority Queue</h2>
          <p className="text-sm text-gray-500">Issues requiring immediate attention</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <span>{pendingCount} Pending Review</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
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
              Loading priority issues...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : filtered.length ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                High Priority Issues
              </div>

              {filtered.map((issue, index) => {
                const urgencyClass = URGENCY_STYLES[issue.urgency] ?? "bg-gray-100 text-gray-700 border-gray-200";
                const statusClass = STATUS_STYLES[issue.status] ?? "bg-gray-100 text-gray-700 border-gray-200";
                const accent = issue.urgency === "urgent" ? "border-rose-400" : "border-orange-300";

                return (
                  <div
                    key={issue.id}
                    className={`rounded-xl border border-gray-200 bg-white shadow-sm pl-4 ${accent}`}
                  >
                    <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                            {formatIssueId(index, filtered.length)}
                          </span>
                          <span className={`rounded-full border px-2.5 py-1 ${urgencyClass}`}>
                            {issue.urgency}
                          </span>
                          <span className={`rounded-full border px-2.5 py-1 ${statusClass}`}>
                            {issue.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-base font-semibold text-gray-900">{issue.title}</div>
                        <div className="text-xs text-gray-500">{formatCategory(issue.category)}</div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {formatLocation(issue)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {issue.reporterName ?? "Citizen"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDaysOpen(issue.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAssign}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300"
                        >
                          Assign
                        </button>
                        <Link
                          href={`/authority/issues/${issue.id}`}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
              No priority issues found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
