"use client";

import React, { useState } from "react";

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
  [key: string]: unknown;
};

export default function ProfileForm({ user }: { user?: UserData | null }) {
  const [firstName, setFirstName] = useState(() => {
    if (!user?.fullName) return "";
    return String(user.fullName).split(" ")[0] || "";
  });
  const [lastName, setLastName] = useState(() => {
    if (!user?.fullName) return "";
    const parts = String(user.fullName).split(" ");
    return parts.slice(1).join(" ") || "";
  });
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(
    user?.tole || user?.municipality || user?.district || ""
  );
  const [dob, setDob] = useState(user?.dob || "");

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-semibold mb-4">Profile Information</h3>

      <div className="flex items-start gap-8 mb-6">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-md bg-blue-50 flex items-center justify-center text-blue-700 text-2xl font-bold">{(user?.fullName || "").slice(0,2).toUpperCase() || "RB"}</div>
          <div className="mt-3">
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="file" className="hidden" />
              <span className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm">Upload Photo</span>
            </label>
            <div className="text-xs text-gray-400 mt-2">JPG, PNG or GIF. Max size 2MB.</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600">First Name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Last Name</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Email Address</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-600">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 rounded-md border border-gray-200" />
            </div>
            <div>
              <label className="text-xs text-gray-600">&nbsp;</label>
              <div className="w-full mt-1 flex justify-end">
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-md mr-2">Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
