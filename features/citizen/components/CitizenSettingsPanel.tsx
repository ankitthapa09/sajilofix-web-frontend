"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, BellRing, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import ProfileForm from "@/features/citizen/components/ProfileForm";
import { usersChangeMyPassword } from "@/lib/api/users";

type UserData = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  wardNumber?: string;
  municipality?: string;
  district?: string;
  tole?: string;
  profilePhoto?: string;
  [key: string]: unknown;
};

type TabKey = "profile" | "notifications" | "privacy" | "security";

type NotificationPrefs = {
  issueStatusUpdates: boolean;
  newCommentAlerts: boolean;
  weeklySummary: boolean;
  emailAlerts: boolean;
};

type PrivacyPrefs = {
  showProfileToAuthorities: boolean;
  showPhoneToAuthorities: boolean;
  showExactLocationByDefault: boolean;
};

type SecurityPrefs = {
  sessionTimeout: "15m" | "30m" | "1h";
  loginAlerts: boolean;
};

const NOTIFICATION_KEY = "citizen_settings_notifications";
const PRIVACY_KEY = "citizen_settings_privacy";
const SECURITY_KEY = "citizen_settings_security";

const defaultNotificationPrefs: NotificationPrefs = {
  issueStatusUpdates: true,
  newCommentAlerts: true,
  weeklySummary: false,
  emailAlerts: true,
};

const defaultPrivacyPrefs: PrivacyPrefs = {
  showProfileToAuthorities: true,
  showPhoneToAuthorities: false,
  showExactLocationByDefault: true,
};

const defaultSecurityPrefs: SecurityPrefs = {
  sessionTimeout: "30m",
  loginAlerts: true,
};

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors " +
          (checked ? "border-blue-600 bg-blue-600" : "border-red-600 bg-red-600")
        }
      >
        <span
          className={
            "inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-5" : "translate-x-1")
          }
        />
      </button>
    </div>
  );
}

export default function CitizenSettingsPanel({ user }: { user?: UserData | null }) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("profile");

  const [notificationPrefs, setNotificationPrefs] = React.useState<NotificationPrefs>(defaultNotificationPrefs);
  const [privacyPrefs, setPrivacyPrefs] = React.useState<PrivacyPrefs>(defaultPrivacyPrefs);
  const [securityPrefs, setSecurityPrefs] = React.useState<SecurityPrefs>(defaultSecurityPrefs);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [passwordSaving, setPasswordSaving] = React.useState(false);

  React.useEffect(() => {
    try {
      const rawNotification = localStorage.getItem(NOTIFICATION_KEY);
      if (rawNotification) {
        setNotificationPrefs({ ...defaultNotificationPrefs, ...(JSON.parse(rawNotification) as Partial<NotificationPrefs>) });
      }

      const rawPrivacy = localStorage.getItem(PRIVACY_KEY);
      if (rawPrivacy) {
        setPrivacyPrefs({ ...defaultPrivacyPrefs, ...(JSON.parse(rawPrivacy) as Partial<PrivacyPrefs>) });
      }

      const rawSecurity = localStorage.getItem(SECURITY_KEY);
      if (rawSecurity) {
        setSecurityPrefs({ ...defaultSecurityPrefs, ...(JSON.parse(rawSecurity) as Partial<SecurityPrefs>) });
      }
    } catch {
      // Ignore local storage parse errors
    }
  }, []);

  const saveNotifications = () => {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notificationPrefs));
    toast.success("Notification settings saved");
  };

  const savePrivacy = () => {
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacyPrefs));
    toast.success("Privacy settings saved");
  };

  const saveSecurity = () => {
    localStorage.setItem(SECURITY_KEY, JSON.stringify(securityPrefs));
    toast.success("Security settings saved");
  };

  const onSavePassword: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }

    if (newPassword.trim().length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setPasswordSaving(true);
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
      setShowChangePassword(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const tabs: Array<{ key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: "profile", label: "Profile", icon: User },
    { key: "notifications", label: "Notifications", icon: BellRing },
    { key: "privacy", label: "Privacy", icon: ShieldCheck },
    { key: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all " +
                (isActive
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50")
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "profile" ? <ProfileForm user={user} /> : null}

      {activeTab === "notifications" ? (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Notification Preferences</h3>
            <p className="mt-1 text-sm text-gray-500">Choose how you receive updates about your reports.</p>
          </div>

          <div className="space-y-3">
            <ToggleRow
              title="Issue Status Updates"
              description="Receive alerts when your report is moved to pending, in progress, resolved, or rejected."
              checked={notificationPrefs.issueStatusUpdates}
              onChange={(value) => setNotificationPrefs((prev) => ({ ...prev, issueStatusUpdates: value }))}
            />
            <ToggleRow
              title="Comment and Activity Alerts"
              description="Get notified when authorities add updates to your reported issue."
              checked={notificationPrefs.newCommentAlerts}
              onChange={(value) => setNotificationPrefs((prev) => ({ ...prev, newCommentAlerts: value }))}
            />
            <ToggleRow
              title="Weekly Summary"
              description="Receive a weekly digest of all your issue report activity."
              checked={notificationPrefs.weeklySummary}
              onChange={(value) => setNotificationPrefs((prev) => ({ ...prev, weeklySummary: value }))}
            />
            <ToggleRow
              title="Email Alerts"
              description="Also send important report updates to your registered email address."
              checked={notificationPrefs.emailAlerts}
              onChange={(value) => setNotificationPrefs((prev) => ({ ...prev, emailAlerts: value }))}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveNotifications}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Notifications
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === "privacy" ? (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Privacy Controls</h3>
            <p className="mt-1 text-sm text-gray-500">Manage what details are visible while handling your reports.</p>
          </div>

          <div className="space-y-3">
            <ToggleRow
              title="Show Profile to Authorities"
              description="Allow authorities to view your profile details from issue reports."
              checked={privacyPrefs.showProfileToAuthorities}
              onChange={(value) => setPrivacyPrefs((prev) => ({ ...prev, showProfileToAuthorities: value }))}
            />
            <ToggleRow
              title="Show Phone to Authorities"
              description="Permit showing your phone number for faster follow-up if needed."
              checked={privacyPrefs.showPhoneToAuthorities}
              onChange={(value) => setPrivacyPrefs((prev) => ({ ...prev, showPhoneToAuthorities: value }))}
            />
            <ToggleRow
              title="Use Exact Location by Default"
              description="When reporting an issue, include exact map coordinates by default."
              checked={privacyPrefs.showExactLocationByDefault}
              onChange={(value) => setPrivacyPrefs((prev) => ({ ...prev, showExactLocationByDefault: value }))}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={savePrivacy}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Privacy
            </button>
          </div>
        </div>
      ) : null}

      {activeTab === "security" ? (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Security Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Update session and account safety preferences.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <label className="text-xs font-semibold text-gray-600">Auto Logout</label>
              <select
                value={securityPrefs.sessionTimeout}
                onChange={(event) =>
                  setSecurityPrefs((prev) => ({ ...prev, sessionTimeout: event.target.value as SecurityPrefs["sessionTimeout"] }))
                }
                className="mt-2 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
              >
                <option value="15m">15 minutes</option>
                <option value="30m">30 minutes</option>
                <option value="1h">1 hour</option>
              </select>
            </div>

            <ToggleRow
              title="Login Alerts"
              description="Show alerts when your account is accessed from a new device."
              checked={securityPrefs.loginAlerts}
              onChange={(value) => setSecurityPrefs((prev) => ({ ...prev, loginAlerts: value }))}
            />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Keep your password strong and update it regularly for better account protection.
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowChangePassword((prev) => !prev)}
                className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                {showChangePassword ? "Close Password Form" : "Change Password"}
              </button>

              <Link href="/forgot-password" className="text-xs font-semibold text-amber-900 underline underline-offset-2">
                Forgot Password?
              </Link>
            </div>
          </div>

          {showChangePassword ? (
            <form onSubmit={onSavePassword} className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <div className="text-sm font-semibold text-gray-900">Update Password</div>

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
                  disabled={passwordSaving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveSecurity}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save Security
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
