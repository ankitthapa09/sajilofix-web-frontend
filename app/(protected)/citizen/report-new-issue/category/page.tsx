"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  Construction,
  Camera,
  MapPin,
  FileText,
  AlertTriangle,
  Droplet,
  Lightbulb,
  Recycle,
  Trees,
  Waves,
  Car,
  Check,
} from "lucide-react";

type Category = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const categories: Category[] = [
  {
    id: "road",
    label: "Road Maintenance",
    icon: Construction,
  },
  {
    id: "lighting",
    label: "Street Lighting",
    icon: Lightbulb,
  },
  {
    id: "waste",
    label: "Waste Management",
    icon: Recycle,
  },
  {
    id: "water",
    label: "Water Supply",
    icon: Droplet,
  },
  {
    id: "drainage",
    label: "Drainage",
    icon: Waves,
  },
  {
    id: "parks",
    label: "Parks & Recreation",
    icon: Trees,
  },
  {
    id: "traffic",
    label: "Traffic & Parking",
    icon: Car,
  },
  {
    id: "other",
    label: "Other",
    icon: ClipboardList,
  },
];

const steps = [
  { id: 1, label: "Category", icon: ClipboardList },
  { id: 2, label: "Photos", icon: Camera },
  { id: 3, label: "Location", icon: MapPin },
  { id: 4, label: "Details", icon: FileText },
  { id: 5, label: "Urgency", icon: AlertTriangle },
  { id: 6, label: "Review", icon: Check },
];

export default function ReportNewIssueCategoryStep() {
  const [selected, setSelected] = useState<string>("");
  const selectedLabel = useMemo(
    () => categories.find((c) => c.id === selected)?.label ?? "",
    [selected]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/citizen"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Step 1 of 6
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
                const isActive = step.id === 1;
                const isDone = step.id < 1;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className={
                        "h-9 w-9 rounded-full border flex items-center justify-center text-sm font-semibold " +
                        (isActive
                          ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                          : isDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
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
              <h3 className="text-base font-semibold text-gray-900">Select Issue Category</h3>
              <p className="text-sm text-gray-500">Choose the category that best describes your issue</p>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = selected === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelected(category.id)}
                    className={
                      "group rounded-2xl border px-4 py-5 text-center transition-all hover:-translate-y-0.5 hover:border-gray-300 " +
                      (isSelected ? "border-emerald-500 bg-emerald-50/40 shadow-sm" : "border-gray-200 bg-white")
                    }
                  >
                    <div className="mx-auto h-11 w-11 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <div className="mt-4 text-sm font-semibold text-gray-800 leading-tight">
                      {category.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
              >
                Cancel
              </button>

              <div className="flex flex-col items-start sm:items-end gap-2">
                {selectedLabel ? (
                  <span className="text-xs text-gray-500">Selected: {selectedLabel}</span>
                ) : null}
                {selected ? (
                  <Link
                    href="/citizen/report-new-issue/upload-photos"
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
        </div>
      </section>
    </div>
  );
}
