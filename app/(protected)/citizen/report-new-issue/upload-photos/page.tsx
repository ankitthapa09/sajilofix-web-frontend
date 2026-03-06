"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  Check,
  ClipboardCheck,
  ClipboardList,
  MapPin,
  AlertTriangle,
  UploadCloud,
  X,
} from "lucide-react";
import { useReportIssue } from "@/features/citizen/components/ReportIssueProvider";

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

export default function ReportNewIssueUploadPhotosStep() {
  const { draft, setPhotos } = useReportIssue();
  const files = draft.photos;
  const previewUrls = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewUrls]);

  const fileLabel = useMemo(() => {
    if (!files.length) return "";
    if (files.length === 1) return files[0]?.name ?? "1 file";
    return `${files.length} files selected`;
  }, [files]);

  const remainingSlots = Math.max(0, 3 - files.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/citizen/report-new-issue/category"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Step 2 of 6
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
                const isActive = step.id === 2;
                const isDone = step.id < 2;
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
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Add Photos</h3>
              <p className="text-sm text-gray-500">Visual evidence helps authorities assess the issue</p>
            </div>

            <label className="mt-6 block">
              <input
                type="file"
                className="sr-only"
                accept="image/png,image/jpeg"
                multiple
                onChange={(event) => {
                  const selected = Array.from(event.target.files ?? []);
                  if (!selected.length || remainingSlots === 0) {
                    event.currentTarget.value = "";
                    return;
                  }
                  const nextFiles = [...files, ...selected].slice(0, 3);
                  setPhotos(nextFiles);
                  event.currentTarget.value = "";
                }}
              />
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 px-6 py-10 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="mt-4 text-sm font-semibold text-gray-800">Click to upload photos</div>
                <div className="text-xs text-gray-500">PNG, JPG up to 10MB each (max 3 photos)</div>
                {fileLabel ? (
                  <div className="mt-3 text-xs font-semibold text-emerald-700">{fileLabel}</div>
                ) : null}
                <div className="mt-1 text-xs text-gray-500">{remainingSlots} slot{remainingSlots === 1 ? "" : "s"} remaining</div>
              </div>
            </label>

            {previewUrls.length ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {previewUrls.map(({ file, url }, index) => (
                  <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="relative h-28 w-full">
                      <Image src={url} alt={file.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotos(files.filter((_, fileIndex) => fileIndex !== index))}
                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="truncate px-3 py-2 text-xs text-gray-600">{file.name}</div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
              <span className="font-semibold">Best Practices:</span> Take clear photos from multiple angles. Include wide
              shots for context and close-ups for details.
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/citizen/report-new-issue/category"
                className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
              >
                Previous
              </Link>

              {files.length ? (
                <Link
                  href="/citizen/report-new-issue/location"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Continue
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center rounded-lg bg-blue-300 px-5 py-2 text-sm font-semibold text-white cursor-not-allowed"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
