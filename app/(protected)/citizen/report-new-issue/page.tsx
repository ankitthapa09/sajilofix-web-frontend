"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  Construction,
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
  tone: string;
  iconTone: string;
};

const categories: Category[] = [
  {
    id: "road",
    label: "Road Maintenance",
    icon: Construction,
    tone: "border-amber-200 bg-amber-50/60",
    iconTone: "text-amber-600",
  },
  {
    id: "lighting",
    label: "Street Lighting",
    icon: Lightbulb,
    tone: "border-yellow-200 bg-yellow-50/60",
    iconTone: "text-yellow-600",
  },
  {
    id: "waste",
    label: "Waste Management",
    icon: Recycle,
    tone: "border-emerald-200 bg-emerald-50/60",
    iconTone: "text-emerald-600",
  },
  {
    id: "water",
    label: "Water Supply",
    icon: Droplet,
    tone: "border-sky-200 bg-sky-50/60",
    iconTone: "text-sky-600",
  },
  {
    id: "drainage",
    label: "Drainage",
    icon: Waves,
    tone: "border-blue-200 bg-blue-50/60",
    iconTone: "text-blue-600",
  },
  {
    id: "parks",
    label: "Parks & Recreation",
    icon: Trees,
    tone: "border-lime-200 bg-lime-50/60",
    iconTone: "text-lime-600",
  },
  {
    id: "traffic",
    label: "Traffic & Parking",
    icon: Car,
    tone: "border-rose-200 bg-rose-50/60",
    iconTone: "text-rose-600",
  },
  {
    id: "other",
    label: "Other",
    icon: ClipboardList,
    tone: "border-gray-200 bg-gray-50",
    iconTone: "text-gray-600",
  },
];

const steps = [
  { id: 1, label: "Category" },
  { id: 2, label: "Photos" },
  { id: 3, label: "Location" },
  { id: 4, label: "Details" },
  { id: 5, label: "Urgency" },
  { id: 6, label: "Review" },
];

export default function ReportNewIssueStep1() {
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
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className={
                        "h-9 w-9 rounded-full border flex items-center justify-center text-sm font-semibold " +
                        (isActive
                          ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                          : isDone
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-gray-200 text-gray-400")
                      }
                    >
                      {isDone ? <Check className="w-4 h-4" /> : step.id}
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
                      "group rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 " +
                      category.tone +
                      (isSelected ? " ring-2 ring-emerald-500 shadow-sm" : "")
                    }
                  >
                    <div
                      className={
                        "h-10 w-10 rounded-xl border border-white/60 flex items-center justify-center " +
                        (isSelected ? "bg-white" : "bg-white/70")
                      }
                    >
                      <Icon className={"w-5 h-5 " + category.iconTone} />
                    </div>
                    <div className="mt-4 text-sm font-semibold text-gray-800">{category.label}</div>
                    {isSelected ? (
                      <div className="mt-2 text-xs font-semibold text-emerald-700">Selected</div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <div className="flex flex-col items-start sm:items-end gap-2">
                {selectedLabel ? (
                  <span className="text-xs text-gray-500">Selected: {selectedLabel}</span>
                ) : null}
                <button
                  type="button"
                  disabled={!selected}
                  className={
                    "inline-flex items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors " +
                    (selected
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-emerald-300 cursor-not-allowed")
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
