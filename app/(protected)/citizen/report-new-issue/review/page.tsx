"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  Check,
  ClipboardCheck,
  ClipboardList,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { createIssueReport } from "@/lib/api/issues";
import { setFlashToast } from "@/lib/toast/flash";
import {
  useReportIssue,
  type IssueCategory,
  type IssueUrgency,
} from "@/features/citizen/components/ReportIssueProvider";

type Step = {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const steps: Step[] = [
  { id: 1, label: "Category", icon: ClipboardList },
  { id: 2, label: "Photos", icon: Camera },
  { id: 3, label: "Location", icon: MapPin },
  { id: 4, label: "Details", icon: ClipboardCheck },
  { id: 5, label: "Urgency", icon: AlertTriangle },
  { id: 6, label: "Review", icon: Check },
];

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  road: "Road Damage",
  lighting: "Street Lighting",
  waste: "Waste Management",
  water: "Water Supply",
  drainage: "Drainage",
  parks: "Public Parks",
  traffic: "Traffic Signals",
  other: "Other",
};

const URGENCY_LABELS: Record<IssueUrgency, { label: string; description: string }> = {
  low: {
    label: "Low Priority",
    description: "Minor issue that can be addressed in normal timeframe",
  },
  medium: {
    label: "Medium Priority",
    description: "Moderate issue requiring attention within a few days",
  },
  high: {
    label: "High Priority",
    description: "Significant issue needing prompt resolution",
  },
  urgent: {
    label: "Urgent",
    description: "Critical issue posing immediate safety or health risk",
  },
};

export default function ReportNewIssueReviewStep() {
  const router = useRouter();
  const { draft, resetDraft } = useReportIssue();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const missingFields = useMemo(() => {
    const missing: string[] = [];

    if (!draft.category) missing.push("category");
    if (!draft.details.title.trim()) missing.push("issue title");
    if (!draft.details.description.trim()) missing.push("description");
    if (!draft.location.address.trim()) missing.push("location address");
    if (!draft.location.district.trim()) missing.push("district");
    if (!draft.location.municipality.trim()) missing.push("municipality");
    if (!draft.location.ward.trim()) missing.push("ward");
    if (!draft.urgency) missing.push("urgency");

    return missing;
  }, [draft]);
  const canSubmit = missingFields.length === 0 && !isSubmitting;

  const categoryLabel = draft.category ? CATEGORY_LABELS[draft.category] : "Not selected";
  const urgencyMeta = draft.urgency ? URGENCY_LABELS[draft.urgency] : null;
  const locationLine = [
    draft.location.address,
    draft.location.ward ? `Ward ${draft.location.ward}` : "",
    draft.location.municipality,
    draft.location.district,
  ]
    .filter(Boolean)
    .join(", ");
  const showLatLng = Boolean(draft.location.latitude && draft.location.longitude);

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Please complete all required fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createIssueReport(draft);
      setFlashToast({
        type: "success",
        message: result.message || "Issue reported successfully.",
      });
      resetDraft();
      router.push("/citizen");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit report";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/citizen/report-new-issue/urgency"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Step 6 of 6
        </div>
      </div>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Report New Issue</h2>
          <p className="text-sm text-gray-500">Help us identify and resolve community issues</p>
        </div>

        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {steps.map((step, index) => {
                const isActive = step.id === 6;
                const isDone = step.id < 6;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className={
                        "h-9 w-9 rounded-full border flex items-center justify-center text-sm font-semibold " +
                        (isActive
                          ? "border-blue-500 text-blue-700 bg-blue-50"
                          : isDone
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-200 text-gray-400")
                      }
                    >
                      {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="text-sm">
                      <div className={isActive ? "font-semibold text-gray-900" : "text-gray-500"}>Step {step.id}</div>
                      <div className={isActive ? "text-gray-700" : "text-gray-400"}>{step.label}</div>
                    </div>
                    {index < steps.length - 1 ? (
                      <div className="hidden sm:block h-px w-10 bg-gray-200" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            <span className="hidden md:inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
              Preview
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Review & Submit</h3>
              <p className="text-sm text-gray-500">Please review your report before submitting</p>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Category</span>
                  <Link href="/citizen/report-new-issue/category" className="text-blue-600 hover:text-blue-700">Edit</Link>
                </div>
                <div className="mt-3 text-sm text-gray-800">{categoryLabel}</div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Location</span>
                  <Link href="/citizen/report-new-issue/location" className="text-blue-600 hover:text-blue-700">Edit</Link>
                </div>
                <div className="mt-3 text-sm text-gray-800">
                  {locationLine || "Not provided"}
                </div>
                {showLatLng ? (
                  <div className="mt-1 text-xs text-gray-500">
                    Lat {draft.location.latitude} • Lng {draft.location.longitude}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 lg:col-span-2">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Issue Details</span>
                  <Link href="/citizen/report-new-issue/details" className="text-blue-600 hover:text-blue-700">Edit</Link>
                </div>
                <div className="mt-3 text-sm text-gray-800">
                  {draft.details.title || "Not provided"}
                </div>
                <div className="text-xs text-gray-500">
                  {draft.details.description || "No description provided."}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Photos</span>
                  <Link href="/citizen/report-new-issue/upload-photos" className="text-blue-600 hover:text-blue-700">Edit</Link>
                </div>
                {draft.photos.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {draft.photos.map((file, index) => (
                      <span
                        key={`${file.name}-${index}`}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600"
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-500">No photos added.</div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Urgency Level</span>
                  <Link href="/citizen/report-new-issue/urgency" className="text-blue-600 hover:text-blue-700">Edit</Link>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <div className="h-8 w-8 rounded-full border border-blue-200 bg-blue-50 text-blue-600 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">{urgencyMeta?.label ?? "Not set"}</div>
                    <div className="text-xs text-gray-500">
                      {urgencyMeta?.description ?? "Select an urgency level for faster prioritization."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {missingFields.length ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
                Complete the missing fields to submit: {missingFields.join(", ")}.
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>By submitting this report, you confirm the information provided is accurate and you agree to our community guidelines.</span>
              </div>
            )}

            <div className="mt-6 border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/citizen/report-new-issue/urgency"
                className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
              >
                Previous
              </Link>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={
                  "inline-flex items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors " +
                  (canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed")
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
