"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, ChevronLeft, ChevronRight, ExternalLink, X, Mail, Phone } from "lucide-react";
import {
  getIssueReport,
  getIssueReporterProfile,
  updateIssueStatus,
  type IssueListItem,
  type IssueReporterProfile,
} from "@/lib/api/issues";
import { toast } from "sonner";
import IssueLocationMapSection from "@/features/shared/map/IssueLocationMapSection";
import IssueImageViewerModal from "@/features/shared/issues/IssueImageViewerModal";

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

function formatCategory(value: string) {
  return CATEGORY_LABELS[value] ?? value;
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

function labelActor(role?: "admin" | "authority") {
  if (role === "admin") return "Admin";
  if (role === "authority") return "Authority";
  return "-";
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

type IssueDetailsPageBaseProps = {
  backHref: string;
  backLabel: string;
  canUpdateStatus?: boolean;
};

export default function IssueDetailsPageBase({
  backHref,
  backLabel,
  canUpdateStatus = false,
}: IssueDetailsPageBaseProps) {
  const params = useParams();
  const issueId = typeof params?.id === "string" ? params.id : "";
  const [issue, setIssue] = useState<IssueListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReporterModalOpen, setIsReporterModalOpen] = useState(false);
  const [isReporterLoading, setIsReporterLoading] = useState(false);
  const [reporterError, setReporterError] = useState<string | null>(null);
  const [reporterProfile, setReporterProfile] = useState<IssueReporterProfile | null>(null);

  useEffect(() => {
    if (!issueId) return;

    let isMounted = true;
    getIssueReport(issueId)
      .then((data) => {
        if (!isMounted) return;
        setIssue(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load issue";
        setError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [issueId]);

  const photos = issue?.photos ?? [];
  const hasPhotos = photos.length > 0;
  const activePhotoUrl = hasPhotos ? resolvePhotoUrl(photos[activePhoto]) : "";

  const urgencyClass = issue?.urgency ? URGENCY_STYLES[issue.urgency] ?? "bg-gray-100 text-gray-700 border-gray-200" : "";
  const statusClass = issue?.status ? STATUS_STYLES[issue.status] ?? "bg-gray-100 text-gray-700 border-gray-200" : "";
  const reporterPhotoUrl = issue?.reporterPhoto ? resolvePhotoUrl(issue.reporterPhoto) : "";
  const reporterInitial = (issue?.reporterName ?? "Citizen").trim().charAt(0).toUpperCase() || "C";

  const reporterStatusClass =
    reporterProfile?.status === "active"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-rose-100 text-rose-700 border-rose-200";

  const reporterModalPhotoUrl = reporterProfile?.profilePhoto ? resolvePhotoUrl(reporterProfile.profilePhoto) : "";
  const reporterModalInitial = (reporterProfile?.fullName ?? issue?.reporterName ?? "Citizen").trim().charAt(0).toUpperCase() || "C";
  const reporterFullAddress =
    reporterProfile?.fullAddress ||
    [
      reporterProfile?.tole,
      reporterProfile?.wardNumber ? `Ward ${reporterProfile.wardNumber}` : "",
      reporterProfile?.municipality,
      reporterProfile?.district,
    ]
      .filter(Boolean)
      .join(", ");

  useEffect(() => {
    if (!isReporterModalOpen && !isImageViewerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isReporterModalOpen, isImageViewerOpen]);

  const goPrev = () => {
    if (!hasPhotos) return;
    setActivePhoto((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goNext = () => {
    if (!hasPhotos) return;
    setActivePhoto((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const onStatusChange = async (status: string) => {
    if (!issue || !canUpdateStatus) return;
    setIsUpdating(true);
    try {
      const result = await updateIssueStatus(issue.id, status);
      const payload = result.data;
      setIssue({
        ...issue,
        status,
        statusUpdatedByRole: payload?.statusUpdatedByRole ?? issue.statusUpdatedByRole,
        statusUpdatedByUserId: payload?.statusUpdatedByUserId ?? issue.statusUpdatedByUserId,
        statusUpdatedAt: payload?.statusUpdatedAt ?? issue.statusUpdatedAt,
      });
      toast.success("Status updated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const openReporterProfileModal = async () => {
    if (!issue?.reporterId) return;
    setIsReporterModalOpen(true);
    setIsReporterLoading(true);
    setReporterError(null);

    try {
      const profile = await getIssueReporterProfile(issue.reporterId);
      setReporterProfile(profile);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load reporter profile";
      setReporterError(message);
    } finally {
      setIsReporterLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Loading issue...
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
                <span className={`rounded-full border px-2.5 py-1 ${statusClass}`}>
                  {STATUS_LABELS[issue.status] ?? issue.status}
                </span>
                <span className={`rounded-full border px-2.5 py-1 ${urgencyClass}`}>
                  {issue.urgency}
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-semibold text-gray-900">{issue.title}</h2>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {formatCategory(issue.category)}
                </div>
                <div>{formatDate(issue.createdAt)}</div>
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
                    <button
                      type="button"
                      onClick={() => setIsImageViewerOpen(true)}
                      className="relative block h-64 w-full"
                      aria-label="Open issue image viewer"
                    >
                      <Image
                        src={activePhotoUrl}
                        alt="Issue evidence"
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                      />
                    </button>
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
                          <div className="relative h-16 w-full">
                            <Image
                              src={thumbUrl}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              sizes="(max-width: 1024px) 33vw, 160px"
                              className="object-cover"
                            />
                          </div>
                        </button>
                      );
                    })}
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
              <div className="text-sm font-semibold text-gray-700">Reporter</div>
              {issue.reporterId ? (
                <button
                  type="button"
                  onClick={() => void openReporterProfileModal()}
                  className="group mt-3 block rounded-2xl border border-gray-200 bg-linear-to-br from-white to-gray-50 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      {reporterPhotoUrl ? (
                        <Image
                          src={reporterPhotoUrl}
                          alt={issue.reporterName || "Reporter"}
                          fill
                          sizes="48px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-50 text-sm font-semibold text-blue-700">
                          {reporterInitial}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-gray-900">{issue.reporterName || "Citizen"}</div>
                      <div className="text-xs text-gray-500">Reported on {formatDate(issue.createdAt)}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition-colors group-hover:bg-blue-100">
                      View profile
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              ) : (
                <div className="mt-3 text-sm text-gray-600">
                  <div className="font-semibold text-gray-900">{issue.reporterName || "Citizen"}</div>
                  <div className="text-xs text-gray-400">Reported on {formatDate(issue.createdAt)}</div>
                </div>
              )}
            </div>

            {canUpdateStatus ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-gray-700">Update Status</div>
                <div className="mt-3">
                  <div className={`inline-flex items-center rounded-full border px-2 py-1 ${statusClass}`}>
                    <select
                      value={issue.status}
                      onChange={(event) => onStatusChange(event.target.value)}
                      disabled={isUpdating}
                      className="bg-transparent text-xs font-semibold outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-700">Status Update Source</div>
              <div className="mt-3 text-sm text-gray-600">
                <div className="font-semibold text-gray-900">{labelActor(issue.statusUpdatedByRole)}</div>
                <div className="text-xs text-gray-400">
                  {issue.statusUpdatedAt ? `Last changed on ${formatDateTime(issue.statusUpdatedAt)}` : "No status changes yet"}
                </div>
              </div>
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

      {isReporterModalOpen ? (
        <div className="fixed inset-0 z-80 bg-black/40 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
              <div>
                <div className="text-sm font-semibold text-gray-900">Reporter Profile</div>
                <div className="text-xs text-gray-500">Citizen details linked to this issue report</div>
              </div>
              <button
                type="button"
                onClick={() => setIsReporterModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
                aria-label="Close reporter profile"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isReporterLoading ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                  Loading reporter profile...
                </div>
              ) : reporterError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                  {reporterError}
                </div>
              ) : reporterProfile ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        {reporterModalPhotoUrl ? (
                          <Image
                            src={reporterModalPhotoUrl}
                            alt={reporterProfile.fullName || "Reporter"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-50 text-lg font-semibold text-blue-700">
                            {reporterModalInitial}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xl font-semibold text-gray-900">{reporterProfile.fullName || issue?.reporterName || "Citizen"}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${reporterStatusClass}`}>
                            {(reporterProfile.status || "unknown").replace("_", " ")}
                          </span>
                          <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {reporterProfile.role || "citizen"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-xs font-semibold text-gray-500">Email</div>
                      <div className="mt-1 inline-flex items-center gap-2 text-sm text-gray-800">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {reporterProfile.email || "-"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-xs font-semibold text-gray-500">Phone</div>
                      <div className="mt-1 inline-flex items-center gap-2 text-sm text-gray-800">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {reporterProfile.phone || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-xs font-semibold text-gray-500">Full Address</div>
                    <div className="mt-1 text-sm text-gray-800">{reporterFullAddress || "Address not available"}</div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-xs font-semibold text-gray-500">Citizenship Number</div>
                    <div className="mt-1 text-sm font-medium text-gray-800">
                      {reporterProfile.citizenshipNumber || "Not provided"}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <IssueImageViewerModal
        isOpen={isImageViewerOpen}
        photos={photos.map((photo) => resolvePhotoUrl(photo))}
        activeIndex={activePhoto}
        onClose={() => setIsImageViewerOpen(false)}
        onPrev={goPrev}
        onNext={goNext}
        onSelect={setActivePhoto}
      />
    </div>
  );
}
