"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  ChevronLeft,
  ChevronRight,
  User,
  BadgeCheck,
  ClipboardCheck,
  Wrench,
} from "lucide-react";
import { getIssueReport, type IssueListItem } from "@/lib/api/issues";
import IssueLocationMapSection from "@/features/shared/map/IssueLocationMapSection";

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
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

function formatLocation(issue: IssueListItem) {
  const parts = [
    issue.location?.address,
    issue.location?.ward ? `Ward ${issue.location.ward}` : "",
    issue.location?.municipality,
    issue.location?.district,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
}

function resolvePhotoUrl(path: string) {
  if (!path) return "";
  const uploadsIndex = path.indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return path.slice(uploadsIndex);
  }
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("uploads/")) return `/${path}`;
  if (path.startsWith("/uploads/")) return path;
  return `/uploads/${path.replace(/^\/+/, "")}`;
}

export default function ReportDetailsPage() {
  const params = useParams();
  const reportId = typeof params?.id === "string" ? params.id : "";
  const [issue, setIssue] = useState<IssueListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!reportId) return;

    let isMounted = true;
    getIssueReport(reportId)
      .then((data) => {
        if (!isMounted) return;
        setIssue(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load report";
        setError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  const urgency = useMemo(() => {
    if (!issue) return null;
    return URGENCY_STYLES[issue.urgency] ?? {
      label: issue.urgency,
      tone: "bg-gray-100 text-gray-700 border-gray-200",
    };
  }, [issue]);

  const status = useMemo(() => {
    if (!issue) return null;
    return STATUS_STYLES[issue.status] ?? {
      label: issue.status,
      tone: "bg-gray-100 text-gray-700 border-gray-200",
    };
  }, [issue]);

  const timelineSteps = useMemo(() => {
    if (!issue) return [] as Array<{
      title: string;
      by: string;
      icon: typeof ClipboardCheck;
      completed: boolean;
      isCurrent: boolean;
      timestamp?: string;
    }>;

    const history = [...(issue.statusHistory ?? [])].sort(
      (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
    );

    const firstChange = history[0];
    const inProgressChange = history.find((item) => item.status === "in_progress");
    const resolvedChange = history.find((item) => item.status === "resolved");
    const rejectedChange = history.find((item) => item.status === "rejected");

    const isInProgress = issue.status === "in_progress";
    const isResolved = issue.status === "resolved";
    const isRejected = issue.status === "rejected";

    const verifiedBy = firstChange?.changedByRole ? `by ${firstChange.changedByRole === "admin" ? "Admin" : "Authority"}` : "by Authority";
    const progressBy = inProgressChange?.changedByRole
      ? `by ${inProgressChange.changedByRole === "admin" ? "Admin" : "Authority"}`
      : "by Authority";
    const finalBy = (resolvedChange ?? rejectedChange)?.changedByRole
      ? `by ${(resolvedChange ?? rejectedChange)?.changedByRole === "admin" ? "Admin" : "Authority"}`
      : "Pending final decision";

    const finalTitle = isRejected ? "Rejected" : "Resolved";

    return [
      {
        title: "Issue Reported",
        by: "by You",
        icon: ClipboardCheck,
        completed: true,
        isCurrent: issue.status === "pending",
        timestamp: issue.createdAt,
      },
      {
        title: "Report Verified and Categorized",
        by: verifiedBy,
        icon: BadgeCheck,
        completed: Boolean(firstChange) || issue.status !== "pending",
        isCurrent: issue.status === "pending" && Boolean(firstChange),
        timestamp:
          firstChange?.changedAt ||
          (issue.status !== "pending" ? issue.statusUpdatedAt || undefined : undefined),
      },
      {
        title: "Work in Progress",
        by: progressBy,
        icon: Wrench,
        completed: Boolean(inProgressChange) || isInProgress || isResolved,
        isCurrent: isInProgress,
        timestamp: inProgressChange?.changedAt || (isInProgress ? issue.statusUpdatedAt || undefined : undefined),
      },
      {
        title: finalTitle,
        by: finalBy,
        icon: User,
        completed: isRejected ? Boolean(rejectedChange) || isRejected : Boolean(resolvedChange) || isResolved,
        isCurrent: isRejected || isResolved,
        timestamp:
          (isRejected ? rejectedChange?.changedAt : resolvedChange?.changedAt) ||
          ((isRejected || isResolved) ? issue.statusUpdatedAt || undefined : undefined),
      },
    ];
  }, [issue]);

  const photos = issue?.photos ?? [];
  const hasPhotos = photos.length > 0;
  const activePhotoUrl = hasPhotos ? resolvePhotoUrl(photos[activePhoto]) : "";

  const goPrev = () => {
    if (!hasPhotos) return;
    setActivePhoto((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (!hasPhotos) return;
    setActivePhoto((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/citizen"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Loading report...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : issue ? (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-600">
                {status ? (
                  <span className={`rounded-full border px-2.5 py-1 ${status.tone}`}>{status.label}</span>
                ) : null}
                {urgency ? (
                  <span className={`rounded-full border px-2.5 py-1 ${urgency.tone}`}>{urgency.label} Priority</span>
                ) : null}
              </div>

              <h2 className="mt-3 text-2xl font-semibold text-gray-900">{issue.title}</h2>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {formatCategory(issue.category)}
                </div>
                <div>{formatDate(issue.createdAt)}</div>
                <div>234 views</div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <div>{formatLocation(issue)}</div>
                    {issue.location?.landmark ? (
                      <div className="text-xs text-gray-400">Near {issue.location.landmark}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-700">Photo Evidence</div>
              {hasPhotos ? (
                <div className="mt-4 space-y-4">
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200">
                    <Image
                      src={activePhotoUrl}
                      alt="Issue evidence"
                      width={600}
                      height={256}
                      className="h-64 w-full object-cover"
                    />
                    {photos.length > 1 ? (
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <button
                          type="button"
                          onClick={goPrev}
                          className="h-9 w-9 rounded-full bg-black/40 text-white shadow-sm hover:bg-black/60"
                        >
                          <ChevronLeft className="mx-auto h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          className="h-9 w-9 rounded-full bg-black/40 text-white shadow-sm hover:bg-black/60"
                        >
                          <ChevronRight className="mx-auto h-5 w-5" />
                        </button>
                      </div>
                    ) : null}
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                      {activePhoto + 1}/{photos.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {photos.slice(0, 3).map((photo, index) => {
                      const thumbUrl = resolvePhotoUrl(photo);
                      const isActive = index === activePhoto;
                      return (
                        <button
                          key={`${photo}-${index}`}
                          type="button"
                          onClick={() => setActivePhoto(index)}
                          className={
                            "overflow-hidden rounded-lg border bg-white " +
                            (isActive ? "border-blue-500" : "border-gray-200")
                          }
                        >
                          <Image
                            src={thumbUrl}
                            alt={`Thumbnail ${index + 1}`}
                            width={100}
                            height={64}
                            className="h-16 w-full object-cover"
                          />
                        </button>
                      );
                    })}
                    {photos.length < 3
                      ? Array.from({ length: 3 - photos.length }).map((_, index) => (
                          <div
                            key={`placeholder-${index}`}
                            className="flex h-16 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs text-gray-400"
                          >
                            Thumbnail
                          </div>
                        ))
                      : null}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  No photo evidence uploaded.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-700">Issue Description</div>
              <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">{issue.description}</p>
            </div>

          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-700">Progress Timeline</div>
              <ol className="mt-4 space-y-6 border-l border-gray-200 pl-6">
                {timelineSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isDone = step.completed;
                  const isCurrent = step.isCurrent;

                  return (
                    <li key={step.title} className="relative pl-8">
                      <span
                        className={
                          "absolute -left-3.25 top-0 flex h-7 w-7 items-center justify-center rounded-full border " +
                          (isDone
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 bg-gray-50 text-gray-500")
                        }
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="text-sm">
                        <div className={isCurrent ? "font-semibold text-gray-900" : "font-semibold text-gray-700"}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {step.timestamp ? formatDateTime(step.timestamp) : "Not reached yet"}
                        </div>
                        <div className="text-xs text-gray-400">{step.by}</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <IssueLocationMapSection
              issueId={issue.id}
              title={issue.title}
              status={issue.status}
              category={formatCategory(issue.category)}
              locationLabel={formatLocation(issue)}
              latitude={issue.location?.latitude}
              longitude={issue.location?.longitude}
              cardTitle="Location"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
