"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MapPin, X } from "lucide-react";

const IssueMapClient = dynamic(() => import("@/features/shared/map/IssueMapClient"), {
  ssr: false,
  loading: () => <div className="h-60 w-full animate-pulse rounded-xl border border-gray-200 bg-gray-100" />,
});

type Props = {
  issueId: string;
  title: string;
  status: string;
  category?: string;
  locationLabel: string;
  latitude?: number | string;
  longitude?: number | string;
  cardTitle?: string;
};

export default function IssueLocationMapSection({
  issueId,
  title,
  status,
  category,
  locationLabel,
  latitude,
  longitude,
  cardTitle = "Location",
}: Props) {
  const INLINE_ZOOM = 19;
  const CLEAR_MAP_ZOOM = 19;
  const [isOpen, setIsOpen] = React.useState(false);

  const normalizedLatitude = Number(latitude);
  const normalizedLongitude = Number(longitude);
  const hasCoordinates = Number.isFinite(normalizedLatitude) && Number.isFinite(normalizedLongitude);

  React.useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-gray-700">{cardTitle}</div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            disabled={!hasCoordinates}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Open Clear Map
          </button>
        </div>

        {hasCoordinates ? (
          <div className="mt-4 space-y-3">
            <div style={{ height: 240 }}>
              <IssueMapClient
                issues={[
                  {
                    id: issueId,
                    title,
                    status,
                    category,
                    latitude: normalizedLatitude,
                    longitude: normalizedLongitude,
                    locationLabel,
                  },
                ]}
                selectedIssueId={issueId}
                center={[normalizedLatitude, normalizedLongitude]}
                zoom={INLINE_ZOOM}
                className="h-full"
              />
            </div>
            <div className="text-xs text-gray-500">{normalizedLatitude.toFixed(6)}, {normalizedLongitude.toFixed(6)}</div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="text-sm font-semibold text-gray-700">Interactive Map</div>
            <div className="text-xs text-gray-400">Coordinates unavailable</div>
          </div>
        )}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-80 bg-black/40 p-4 backdrop-blur-sm sm:p-6">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
              <div>
                <div className="text-sm font-semibold text-gray-900">Issue Location Map</div>
                <div className="text-xs text-gray-500">{locationLabel}</div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
                aria-label="Close map"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-4 sm:p-6">
              {hasCoordinates ? (
                <IssueMapClient
                  issues={[
                    {
                      id: issueId,
                      title,
                      status,
                      category,
                      latitude: normalizedLatitude,
                      longitude: normalizedLongitude,
                      locationLabel,
                    },
                  ]}
                  selectedIssueId={issueId}
                  center={[normalizedLatitude, normalizedLongitude]}
                  zoom={CLEAR_MAP_ZOOM}
                  className="h-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
                  Coordinates unavailable for this issue.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
