import React from "react";
import ProfileForm from "../../../../features/citizen/components/ProfileForm";
import { getUserData } from "../../../../lib/cookie";

export default async function SettingsPage() {
  const user = await getUserData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
              <div className="rounded-full bg-gray-100 px-3 py-1 text-sm">Profile</div>
              <div className="text-sm text-gray-400">Notifications</div>
              <div className="text-sm text-gray-400">Privacy</div>
              <div className="text-sm text-gray-400">Security</div>
            </div>

            <ProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
