"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  ClipboardCheck,
  ClipboardList,
  MapPin,
  AlertTriangle,
} from "lucide-react";

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

export default function ReportNewIssueReviewStep() {
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

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Category</span>
                  <button type="button" className="text-blue-600 hover:text-blue-700">Edit</button>
                </div>
                <div className="mt-3 text-sm text-gray-800">Street Lighting</div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Location</span>
                  <button type="button" className="text-blue-600 hover:text-blue-700">Edit</button>
                </div>
                <div className="mt-3 text-sm text-gray-800">Thamel, Ward 26, Kathmandu</div>
                <div className="mt-1 text-xs text-gray-500">Lat 27.7172 • Lng 85.3240</div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Issue Details</span>
                  <button type="button" className="text-blue-600 hover:text-blue-700">Edit</button>
                </div>
                <div className="mt-3 text-sm text-gray-800">Broken street light near the main gate</div>
                <div className="text-xs text-gray-500">Light flickers at night and the area feels unsafe.</div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Photos</span>
                  <button type="button" className="text-blue-600 hover:text-blue-700">Edit</button>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-16 w-16 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-xs text-gray-500">
                    Photo 1
                  </div>
                  <div className="h-16 w-16 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-xs text-gray-500">
                    Photo 2
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>Urgency Level</span>
                  <button type="button" className="text-blue-600 hover:text-blue-700">Edit</button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                  <div className="h-8 w-8 rounded-full border border-blue-200 bg-blue-50 text-blue-600 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Low Priority</div>
                    <div className="text-xs text-gray-500">Minor issue that can be addressed in normal timeframe</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>By submitting this report, you confirm the information provided is accurate and you agree to our community guidelines.</span>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/citizen/report-new-issue/urgency"
                className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
              >
                Previous
              </Link>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
