"use client";

import React, { useMemo, useState } from "react";
import { Bell, Lock, Shield, User as UserIcon } from "lucide-react";
import AdminSettingsProfile from "@/features/admin/components/AdminSettingsProfile";

type TabKey = "profile" | "notifications" | "privacy" | "security";

export default function AdminSettingsClient() {
  const [tab, setTab] = useState<TabKey>("profile");

  const tabs = useMemo(
    () => [
      { key: "profile" as const, label: "Profile", icon: UserIcon },
      { key: "notifications" as const, label: "Notifications", icon: Bell },
      { key: "privacy" as const, label: "Privacy", icon: Shield },
      { key: "security" as const, label: "Security", icon: Lock },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Tabs bar (match screenshot) */}
        <div className="px-6 pt-5">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-1 flex items-center gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={
                    "flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-md text-sm font-semibold transition-colors " +
                    (active
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900")
                  }
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {tab === "profile" ? (
            <AdminSettingsProfile />
          ) : (
            <div className="min-h-[260px] rounded-lg border border-gray-200 bg-white p-6">
              <div className="text-sm text-gray-700 font-semibold">{tabs.find((x) => x.key === tab)?.label}</div>
              <div className="mt-2 text-sm text-gray-500">
                This section is UI-ready. Hook it to real settings APIs when available.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
