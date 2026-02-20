"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  ClipboardCheck,
  ClipboardList,
  MapPin,
  AlertTriangle,
  Info,
  AlertCircle,
} from "lucide-react";
import { useReportIssue } from "@/features/citizen/components/ReportIssueProvider";

type Step = {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type UrgencyOption = {
  id: "low" | "medium" | "high" | "urgent";
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  iconTone: string;
};

const steps: Step[] = [
  { id: 1, label: "Category", icon: ClipboardList },
  { id: 2, label: "Photos", icon: Camera },
  { id: 3, label: "Location", icon: MapPin },
  { id: 4, label: "Details", icon: ClipboardCheck },
  { id: 5, label: "Urgency", icon: AlertTriangle },
  { id: 6, label: "Review", icon: Check },
];

const options: UrgencyOption[] = [
  {
    id: "low",
    label: "Low Priority",
    description: "Minor issue that can be addressed in normal timeframe",
    icon: Info,
    tone: "bg-blue-50/80 border-blue-200",
    iconTone: "text-blue-600",
  },
  {
    id: "medium",
    label: "Medium Priority",
    description: "Moderate issue requiring attention within a few days",
    icon: AlertCircle,
    tone: "bg-amber-50/80 border-amber-200",
    iconTone: "text-amber-600",
  },
  {
    id: "high",
    label: "High Priority",
    description: "Significant issue needing prompt resolution",
    icon: AlertTriangle,
    tone: "bg-orange-50/80 border-orange-200",
    iconTone: "text-orange-600",
  },
  {
    id: "urgent",
    label: "Urgent",
    description: "Critical issue posing immediate safety or health risk",
    icon: AlertTriangle,
    tone: "bg-rose-50/80 border-rose-200",
    iconTone: "text-rose-600",
  },
];

export default function ReportNewIssueUrgencyStep() {
  const { draft, setUrgency } = useReportIssue();
  const selected = draft.urgency ?? "low";

  useEffect(() => {
    if (!draft.urgency) {
      setUrgency("low");
    }
  }, [draft.urgency, setUrgency]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/citizen/report-new-issue/details"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Step 5 of 6
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
                const isActive = step.id === 5;
                const isDone = step.id < 5;
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
              <h3 className="text-base font-semibold text-gray-900">Set Urgency Level</h3>
              <p className="text-sm text-gray-500">Help us prioritize and respond to your issue appropriately</p>
            </div>

            <div className="mt-5 space-y-3">
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = selected === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setUrgency(option.id)}
                    className={
                      "w-full rounded-2xl border px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm hover:border-blue-300 " +
                      option.tone +
                      (isSelected ? " ring-2 ring-blue-400 border-blue-400" : "")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-9 w-9 rounded-full border border-white bg-white/70 flex items-center justify-center">
                        <Icon className={`h-5 w-5 ${option.iconTone}`} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </div>
                      {isSelected ? (
                        <div className="ml-auto flex items-center justify-center h-7 w-7 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                          <Check className="h-4 w-4" />
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
              <div className="mt-0.5 h-6 w-6 rounded-full border border-blue-200 bg-white text-blue-600 flex items-center justify-center">
                <Info className="h-3.5 w-3.5" />
              </div>
              <span>
                <span className="font-semibold">Note:</span> Urgent issues will be prioritized for immediate attention. Please only mark as
                urgent if the issue poses immediate safety or health risks.
              </span>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/citizen/report-new-issue/details"
                className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
              >
                Previous
              </Link>

              <Link
                href="/citizen/report-new-issue/review"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Continue
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
