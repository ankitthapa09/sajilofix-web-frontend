"use client";

import React, { useState } from "react";
import { usersGetMe, usersUpdateMyPhoto } from "@/lib/api/users";
import { toast } from "sonner";

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

function fullNameToInitials(fullName: string | undefined) {
  const v = (fullName ?? "").trim();
  if (!v) return "RB";
  return v.slice(0, 2).toUpperCase();
}

function toPhotoUrl(profilePhoto: string | undefined) {
  const v = (profilePhoto ?? "").trim();
  if (!v) return "";

  // If backend stored an absolute URL already.
  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const normalized = v.startsWith("/") ? v : `/${v}`;
  return `${baseUrl}${normalized}`;
}

export default function ProfileForm({ user }: { user?: UserData | null }) {
  const [currentUser, setCurrentUser] = useState<UserData | null | undefined>(user);

  const [firstName, setFirstName] = useState(() => {
    if (!currentUser?.fullName) return "";
    return String(currentUser.fullName).split(" ")[0] || "";
  });
  const [lastName, setLastName] = useState(() => {
    if (!currentUser?.fullName) return "";
    const parts = String(currentUser.fullName).split(" ");
    return parts.slice(1).join(" ") || "";
  });
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(
    currentUser?.tole || currentUser?.municipality || currentUser?.district || ""
  );
  const [dob, setDob] = useState(currentUser?.dob || "");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<string>("");

  React.useEffect(() => {
    // Fetch fresh profile (includes profilePhoto) even if cookie is stale.
    // Safe to ignore failure; the page can still render.
    void (async () => {
      try {
        const me = await usersGetMe();
        setCurrentUser(me.user);
      } catch {
        // ignore
      }
    })();
  }, []);

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSaveError("");
    setSaveSuccess("");
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSelectedFile(null);
      setPreviewUrl("");
      setSaveError("Please select an image file.");
      return;
    }

    // UI says 2MB; backend allows 5MB.
    if (file.size > 2 * 1024 * 1024) {
      setSelectedFile(null);
      setPreviewUrl("");
      setSaveError("Image must be ≤ 2MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onCancel = () => {
    setSaveError("");
    setSaveSuccess("");
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const onSave: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    if (!selectedFile) {
      setSaveError("Please choose a profile photo to upload.");
      toast.error("Please choose a profile photo to upload.");
      return;
    }

    setSaving(true);
    try {
      const resp = await usersUpdateMyPhoto(selectedFile);
      setCurrentUser(resp.user);
      setSelectedFile(null);
      setPreviewUrl("");
      setSaveSuccess("Profile photo updated.");
      toast.success("Profile photo updated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload photo";
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const initials = fullNameToInitials(currentUser?.fullName);
  const existingPhotoUrl = toPhotoUrl(currentUser?.profilePhoto);
  const activePhotoUrl = previewUrl || existingPhotoUrl;

  return (
    <form onSubmit={onSave} className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-semibold mb-4">Profile Information</h3>

      {(saveError || saveSuccess) && (
        <div
          className={`mb-4 rounded-md border px-4 py-3 text-sm ${
            saveError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {saveError || saveSuccess}
        </div>
      )}

      <div className="flex items-start gap-8 mb-6">
        <div className="shrink-0">
          {activePhotoUrl ? (
            <img
              src={activePhotoUrl}
              alt="Profile"
              className="w-24 h-24 rounded-md object-cover border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-md bg-blue-50 flex items-center justify-center text-blue-700 text-2xl font-bold">
              {initials}
            </div>
          )}
          <div className="mt-3">
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="hidden"
              />
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
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-md mr-2"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
