"use client";

import React from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { divIcon, type LatLngExpression } from "leaflet";

export type MapIssuePoint = {
  id: string;
  title: string;
  status: string;
  latitude: number;
  longitude: number;
  category?: string;
  locationLabel?: string;
};

type Props = {
  issues?: MapIssuePoint[];
  selectedIssueId?: string;
  onSelectIssue?: (id: string) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
  selectedZoom?: number;
  showLegend?: boolean;
  pickMode?: boolean;
  pickedLocation?: { latitude: number; longitude: number } | null;
  pickedZoom?: number;
  onPickLocation?: (latitude: number, longitude: number) => void;
};

const STATUS_COLORS: Record<string, string> = {
  resolved: "#22c55e",
  in_progress: "#f97316",
  pending: "#64748b",
  rejected: "#ef4444",
};

function markerColor(status?: string) {
  if (!status) return "#64748b";
  return STATUS_COLORS[status] ?? "#64748b";
}

function issuePinIcon(color: string, selected: boolean) {
  const scale = selected ? 1.15 : 1;
  return divIcon({
    className: "issue-map-pin-wrapper",
    html: `<div style="
      width:22px;
      height:22px;
      border-radius:9999px 9999px 9999px 0;
      background:${color};
      border:2px solid #ffffff;
      box-shadow:0 6px 14px rgba(0,0,0,0.25);
      transform:rotate(-45deg) scale(${scale});
      transform-origin:center;
      position:relative;
    ">
      <span style="
        position:absolute;
        width:8px;
        height:8px;
        border-radius:9999px;
        background:#ffffff;
        top:5px;
        left:5px;
      "></span>
    </div>`,
    iconSize: [28, 34],
    iconAnchor: [14, 34],
    popupAnchor: [0, -28],
  });
}

function MapClickHandler({
  enabled,
  onPickLocation,
}: {
  enabled: boolean;
  onPickLocation?: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      if (!enabled || !onPickLocation) return;
      onPickLocation(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function FitBoundsToData({
  issues,
  selectedIssueId,
  pickedLocation,
  focusZoom,
  selectedZoom,
  pickedZoom,
}: {
  issues: MapIssuePoint[];
  selectedIssueId?: string;
  pickedLocation?: { latitude: number; longitude: number } | null;
  focusZoom: number;
  selectedZoom: number;
  pickedZoom: number;
}) {
  const map = useMap();

  React.useEffect(() => {
    if (pickedLocation) {
      map.setView([pickedLocation.latitude, pickedLocation.longitude], pickedZoom, { animate: true });
      return;
    }

    const selected = selectedIssueId ? issues.find((issue) => issue.id === selectedIssueId) : undefined;
    if (selected) {
      map.setView([selected.latitude, selected.longitude], selectedZoom, { animate: true });
      return;
    }

    if (!issues.length) return;

    if (issues.length === 1) {
      map.setView([issues[0].latitude, issues[0].longitude], focusZoom, { animate: false });
      return;
    }

    const bounds = issues.map((issue) => [issue.latitude, issue.longitude] as [number, number]);
    map.fitBounds(bounds, { padding: [36, 36] });
  }, [focusZoom, issues, map, pickedLocation, pickedZoom, selectedIssueId, selectedZoom]);

  return null;
}

export default function IssueMapClient({
  issues = [],
  selectedIssueId,
  onSelectIssue,
  className,
  center = [27.7172, 85.324],
  zoom = 12,
  selectedZoom = 16,
  showLegend = false,
  pickMode = false,
  pickedLocation,
  pickedZoom = 16,
  onPickLocation,
}: Props) {
  const initialCenter = (pickedLocation
    ? [pickedLocation.latitude, pickedLocation.longitude]
    : center) as LatLngExpression;

  return (
    <div
      style={{ minHeight: 220 }}
      className={
        "relative w-full overflow-hidden rounded-2xl border border-gray-200 " +
        (className ?? "h-105")
      }
    >
      <MapContainer center={initialCenter} zoom={zoom} scrollWheelZoom className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler enabled={pickMode} onPickLocation={onPickLocation} />
        <FitBoundsToData
          issues={issues}
          selectedIssueId={selectedIssueId}
          pickedLocation={pickedLocation}
          focusZoom={zoom}
          selectedZoom={selectedZoom}
          pickedZoom={pickedZoom}
        />

        {issues.map((issue) => {
          const isSelected = selectedIssueId === issue.id;
          const color = markerColor(issue.status);

          return (
            <Marker
              key={issue.id}
              position={[issue.latitude, issue.longitude]}
              icon={issuePinIcon(color, isSelected)}
              eventHandlers={{
                click: () => {
                  onSelectIssue?.(issue.id);
                },
              }}
            >
              <Popup>
                <div className="min-w-45">
                  <div className="text-sm font-semibold text-gray-900">{issue.title}</div>
                  {issue.category ? <div className="text-xs text-gray-500">{issue.category}</div> : null}
                  {issue.locationLabel ? <div className="text-xs text-gray-500">{issue.locationLabel}</div> : null}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {pickMode && pickedLocation ? (
          <Marker
            position={[pickedLocation.latitude, pickedLocation.longitude]}
            icon={issuePinIcon("#2563eb", true)}
          />
        ) : null}
      </MapContainer>

      {showLegend ? (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-[11px] text-gray-700 shadow-sm backdrop-blur">
          <div className="mb-1 font-semibold text-gray-600">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Resolved</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> In Progress</div>
            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Pending</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
