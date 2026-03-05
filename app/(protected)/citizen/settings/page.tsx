import React from "react";
import CitizenSettingsPanel from "@/features/citizen/components/CitizenSettingsPanel";
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
          <CitizenSettingsPanel user={user} />
        </div>
      </div>
    </div>
  );
}
