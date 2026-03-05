"use client";

import React, { useMemo, useState } from "react";
import { Bell, Lock, Shield, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { usersChangeMyPassword } from "@/lib/api/users";
import AuthoritySettingsProfile from "@/features/authority/components/AuthoritySettingsProfile";

type TabKey = "profile" | "notifications" | "privacy" | "security";

export default function AuthoritySettingsPanel() {
  const [tab, setTab] = useState<TabKey>("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const tabs = useMemo(
    () => [
      { key: "profile" as const, label: "Profile", icon: UserIcon },
      { key: "notifications" as const, label: "Notifications", icon: Bell },
      { key: "privacy" as const, label: "Privacy", icon: Shield },
      { key: "security" as const, label: "Security", icon: Lock },
    ],
    [],
  );

  const onSubmitPassword: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }

    if (newPassword.trim().length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const result = await usersChangeMyPassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });
      toast.success(result.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
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
            <AuthoritySettingsProfile />
          ) : tab === "security" ? (
            <div className="min-h-[260px] rounded-lg border border-gray-200 bg-white p-6">
              <div className="text-sm font-semibold text-gray-900">Security</div>
              <div className="mt-2 text-sm text-gray-500">
                Change your password regularly to keep your authority account secure.
              </div>

              <form onSubmit={onSubmitPassword} className="mt-5 space-y-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Current Password</label>
                    <div className="relative mt-1">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-800"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-gray-500 hover:text-gray-700"
                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">New Password</label>
                    <div className="relative mt-1">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-800"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-gray-500 hover:text-gray-700"
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
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
