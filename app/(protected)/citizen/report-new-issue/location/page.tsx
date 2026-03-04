"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Camera,
  Check,
  ClipboardCheck,
  ClipboardList,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useReportIssue } from "@/features/citizen/components/ReportIssueProvider";
import { reverseGeocodeLocation } from "@/lib/api/issues";

const IssueMapClient = dynamic(() => import("@/features/shared/map/IssueMapClient"), {
  ssr: false,
  loading: () => <div className="mt-6 h-80 animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />,
});

const NEPAL_BOUNDS = {
  minLat: 26.3,
  maxLat: 30.5,
  minLng: 80.0,
  maxLng: 88.3,
};

function isWithinNepal(latitude: number, longitude: number) {
  return (
    latitude >= NEPAL_BOUNDS.minLat &&
    latitude <= NEPAL_BOUNDS.maxLat &&
    longitude >= NEPAL_BOUNDS.minLng &&
    longitude <= NEPAL_BOUNDS.maxLng
  );
}

function parseWardFromText(value?: string) {
  if (!value) return undefined;

  const patterns = [
    /\b(?:ward|wd|wada|woda|वडा)\s*(?:no\.?|number|नं\.?)?\s*[-:]?\s*(\d{1,3})\b/i,
    /(?:^|[\s,])[A-Za-z\u0900-\u097F.'’]+\s*[-–]\s*(\d{1,3})\b/u,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return undefined;
}

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

export default function ReportNewIssueLocationStep() {
  const { draft, updateLocation } = useReportIssue();
  const [isAutoFilling, setIsAutoFilling] = React.useState(false);
  const [autoFillError, setAutoFillError] = React.useState<string | null>(null);

  const lat = Number(draft.location.latitude);
  const lng = Number(draft.location.longitude);
  const pickedLocation =
    Number.isFinite(lat) && Number.isFinite(lng) && isWithinNepal(lat, lng)
      ? { latitude: lat, longitude: lng }
      : null;

  React.useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (isWithinNepal(lat, lng)) return;

    updateLocation({
      latitude: "",
      longitude: "",
    });
    setAutoFillError("Selected point is outside Nepal. Please pick a location inside Nepal.");
  }, [lat, lng, updateLocation]);

  const autoFillLocation = React.useCallback(
    async (latitude: number, longitude: number) => {
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      if (!isWithinNepal(latitude, longitude)) {
        setAutoFillError("Selected point is outside Nepal. Please pick a location inside Nepal.");
        return;
      }

      setIsAutoFilling(true);
      setAutoFillError(null);

      try {
        const result = await reverseGeocodeLocation(latitude, longitude);
        updateLocation({
          latitude: result.latitude.toFixed(6),
          longitude: result.longitude.toFixed(6),
          address: result.address ?? draft.location.address,
          district: result.district ?? draft.location.district,
          municipality: result.municipality ?? draft.location.municipality,
          ward: result.ward ?? parseWardFromText(result.address) ?? draft.location.ward,
          landmark: result.landmark ?? draft.location.landmark,
        });
      } catch (err: unknown) {
        setAutoFillError(err instanceof Error ? err.message : "Failed to auto-fill location");
      } finally {
        setIsAutoFilling(false);
      }
    },
    [draft.location.address, draft.location.district, draft.location.landmark, draft.location.municipality, draft.location.ward, updateLocation],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/citizen/report-new-issue/upload-photos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Step 3 of 6
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
                const isActive = step.id === 3;
                const isDone = step.id < 3;
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
              <h3 className="text-base font-semibold text-gray-900">Specify Location</h3>
              <p className="text-sm text-gray-500">Help us locate the issue precisely</p>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-slate-100/70 p-3">
              <IssueMapClient
                pickMode
                center={[27.7172, 85.324]}
                zoom={12}
                pickedLocation={pickedLocation}
                onPickLocation={(latitude, longitude) => {
                  const fixedLat = Number(latitude.toFixed(6));
                  const fixedLng = Number(longitude.toFixed(6));

                  if (!isWithinNepal(fixedLat, fixedLng)) {
                    setAutoFillError("Selected point is outside Nepal. Please pick a location inside Nepal.");
                    return;
                  }

                  updateLocation({
                    latitude: fixedLat.toFixed(6),
                    longitude: fixedLng.toFixed(6),
                  });
                  void autoFillLocation(fixedLat, fixedLng);
                }}
                className="h-80 w-full overflow-hidden rounded-xl border border-gray-200"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <div className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                  <MapPin className="h-3.5 w-3.5" /> Click map to pin exact location
                </div>
                <div className="rounded-full border border-gray-200 bg-white px-2.5 py-1 font-semibold">
                  {pickedLocation
                    ? `Selected: ${pickedLocation.latitude.toFixed(6)}, ${pickedLocation.longitude.toFixed(6)}`
                    : "No coordinates selected yet"}
                </div>
                {isAutoFilling ? (
                  <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                    Auto-filling address...
                  </div>
                ) : null}
                {autoFillError ? (
                  <div className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">
                    {autoFillError}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-800">Latitude</label>
                <input
                  value={draft.location.latitude}
                  onChange={(event) => updateLocation({ latitude: event.target.value })}
                  onBlur={(event) => {
                    const value = Number(event.target.value);
                    const lngValue = Number(draft.location.longitude);
                    if (Number.isFinite(value) && Number.isFinite(lngValue)) {
                      void autoFillLocation(value, lngValue);
                    }
                  }}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800">Longitude</label>
                <input
                  value={draft.location.longitude}
                  onChange={(event) => updateLocation({ longitude: event.target.value })}
                  onBlur={(event) => {
                    const value = Number(event.target.value);
                    const latValue = Number(draft.location.latitude);
                    if (Number.isFinite(value) && Number.isFinite(latValue)) {
                      void autoFillLocation(latValue, value);
                    }
                  }}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-800">Location Address</label>
              <input
                placeholder="e.g., Thamel, Ward 26, Kathmandu"
                value={draft.location.address}
                onChange={(event) => updateLocation({ address: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-800">District</label>
                <input
                  placeholder="e.g., Kathmandu"
                  value={draft.location.district}
                  onChange={(event) => updateLocation({ district: event.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800">Municipality</label>
                <input
                  placeholder="e.g., Kathmandu Metropolitan"
                  value={draft.location.municipality}
                  onChange={(event) => updateLocation({ municipality: event.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800">Ward</label>
                <input
                  placeholder="e.g., 26"
                  value={draft.location.ward}
                  onChange={(event) => updateLocation({ ward: event.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-gray-800">Nearby Landmark (Optional)</label>
              <input
                placeholder="e.g., Near Kathmandu Guest House"
                value={draft.location.landmark}
                onChange={(event) => updateLocation({ landmark: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700"
              />
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/citizen/report-new-issue/upload-photos"
                className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50"
              >
                Previous
              </Link>

              <Link
                href="/citizen/report-new-issue/details"
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
