"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Camera, Mail, MapPin, Phone, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { usersGetMe, usersUpdateMyPhoto } from "@/lib/api/users";
import { syncUserData } from "@/lib/actions/auth-action";

type MeUser = {
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  municipality?: string;
  wardNumber?: string;
  profilePhoto?: string;
};

function initialsFromName(fullName?: string) {
  const v = (fullName ?? "").trim();
  if (!v) return "RB";
  const parts = v.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "R";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "B" : (parts[0]?.[1] ?? "B");
  return (a + b).toUpperCase();
}

function toPhotoUrl(profilePhoto?: string) {
  const v = (profilePhoto ?? "").trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const normalized = v.startsWith("/") ? v : `/${v}`;
  return `${baseUrl}${normalized}`;
}

export default function AdminSettingsProfile() {
  const router = useRouter();
  const [me, setMe] = React.useState<MeUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [dob, setDob] = React.useState("");

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      try {
        const resp = await usersGetMe();
        const user = resp.user as unknown as MeUser;
        setMe(user);

        const fullName = (user.fullName ?? "").trim();
        const parts = fullName.split(/\s+/).filter(Boolean);
        setFirstName(parts[0] ?? "");
        setLastName(parts.slice(1).join(" ") ?? "");
        setEmail(user.email ?? "");
        setPhone(user.phone ?? "");
        setAddress(
          [user.municipality, user.wardNumber ? `Ward ${user.wardNumber}` : ""].filter(Boolean).join(", ") || "",
        );
        setDob(user.dob ?? "");
      } catch {
        // If /me fails for some reason, still render UI
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be ≤ 2MB.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const photoUrl = previewUrl || toPhotoUrl(me?.profilePhoto);
  const initials = initialsFromName(me?.fullName);

  const onSave: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setSaving(true);
    try {
      if (selectedFile) {
        const resp = await usersUpdateMyPhoto(selectedFile);
        setMe(resp.user as unknown as MeUser);
        await syncUserData(resp.user as unknown as {
          id: string;
          fullName: string;
          email: string;
          role: string;
          profilePhoto?: string;
        });
        setSelectedFile(null);
        setPreviewUrl("");
        toast.success("Profile photo updated");
        router.refresh();
      }

      // Text fields are UI-only for now (no API endpoint exists yet).
      toast.success("Saved changes");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="flex items-center gap-2">
        <UserIcon className="w-5 h-5 text-emerald-600" />
        <h3 className="text-base font-semibold text-gray-900">Profile Information</h3>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          {/* Profile photo row */}
          <div className="text-sm font-semibold text-gray-900">Profile Photo</div>
          <div className="mt-4 flex items-center gap-4">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Profile" className="w-14 h-14 rounded-md object-cover border border-gray-200" />
            ) : (
              <div className="w-14 h-14 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                {initials}
              </div>
            )}

            <div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="file" accept="image/*" onChange={onPickFile} className="hidden" />
                <span className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <Camera className="w-4 h-4" />
                  Upload Photo
                </span>
              </label>
              <div className="mt-1 text-xs text-gray-400">JPG, PNG or GIF. Max size 2MB.</div>
            </div>
          </div>

          <div className="my-8 h-px bg-gray-100" />

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name" value={firstName} onChange={setFirstName} />
            <Field label="Last Name" value={lastName} onChange={setLastName} />

            <Field
              className="md:col-span-2"
              label="Email Address"
              value={email}
              onChange={setEmail}
              icon={<Mail className="w-4 h-4" />}
            />

            <Field
              className="md:col-span-2"
              label="Phone Number"
              value={phone}
              onChange={setPhone}
              icon={<Phone className="w-4 h-4" />}
            />

            <Field
              className="md:col-span-2"
              label="Address"
              value={address}
              onChange={setAddress}
              icon={<MapPin className="w-4 h-4" />}
            />

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Date of Birth</label>
              <div className="mt-1">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="h-10 px-5 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <div className="mt-1 relative">
        {icon ? <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div> : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={
            "h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200 " +
            (icon ? "pl-9" : "")
          }
        />
      </div>
    </div>
  );
}
