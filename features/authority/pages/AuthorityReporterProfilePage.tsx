"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { getIssueReporterProfile, type IssueReporterProfile } from "@/lib/api/issues";

function resolvePhotoUrl(path: string) {
  if (!path) return "";
  const uploadsIndex = path.indexOf("/uploads/");
  if (uploadsIndex >= 0) return path.slice(uploadsIndex);
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("uploads/")) return `/${path}`;
  if (path.startsWith("/uploads/")) return path;
  return `/uploads/${path.replace(/^\/+/, "")}`;
}

export default function AuthorityReporterProfilePage() {
  const params = useParams();
  const reporterId = typeof params?.id === "string" ? params.id : "";

  const [profile, setProfile] = useState<IssueReporterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reporterId) return;

    let isMounted = true;
    getIssueReporterProfile(reporterId)
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load reporter profile";
        setError(message);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reporterId]);

  const photoUrl = profile?.profilePhoto ? resolvePhotoUrl(profile.profilePhoto) : "";
  const initials = useMemo(() => {
    const fullName = (profile?.fullName ?? "Citizen").trim();
    if (!fullName) return "C";
    return fullName
      .split(" ")
      .slice(0, 2)
      .map((item) => item.charAt(0).toUpperCase())
      .join("");
  }, [profile?.fullName]);

  const location = [profile?.tole, profile?.wardNumber ? `Ward ${profile.wardNumber}` : "", profile?.municipality, profile?.district]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-5">
      <Link
        href="/authority/issues"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Issues
      </Link>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-12 text-center text-sm text-gray-500">
          Loading reporter profile...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
      ) : profile ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="group relative h-20 w-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={profile.fullName}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-50 text-xl font-semibold text-blue-700">
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{profile.fullName}</h1>
                <p className="mt-1 text-sm text-gray-500">Citizen Reporter Profile</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">Email</div>
                <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {profile.email || "-"}
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="text-xs font-semibold text-gray-500">Phone</div>
                <div className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {profile.phone || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-700">Address Overview</div>
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                <MapPin className="h-4 w-4" />
                Registered Location
              </div>
              <div className="mt-2 text-sm text-gray-700">{location || "Address not available"}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="text-gray-500">Ward</div>
                <div className="mt-1 font-semibold text-gray-800">{profile.wardNumber || "-"}</div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="text-gray-500">District</div>
                <div className="mt-1 font-semibold text-gray-800">{profile.district || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
