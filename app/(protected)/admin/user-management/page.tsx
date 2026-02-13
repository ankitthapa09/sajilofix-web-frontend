"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
  Bell,
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  adminCreateAuthority,
  adminCreateCitizen,
  adminDeleteAuthority,
  adminDeleteCitizen,
  adminGetAuthority,
  adminGetCitizen,
  adminListUsers,
  adminUpdateAuthority,
  adminUpdateCitizen,
} from "@/lib/api/admin";
import { toast } from "sonner";

type Role = "admin" | "authority" | "citizen";
type Status = "active" | "suspended";

type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  profilePhoto?: string;
  department?: string;
  status: Status;
  joinedDate: string;
  lastActive: string;
  activity: string;
};

function resolveProfilePhotoUrl(profilePhoto?: string) {
  const v = (profilePhoto ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");
  const path = v.startsWith("/") ? v : `/${v}`;
  return `${base}${path}`;
}

function initialsFromName(name: string) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

function badgeForRole(role: Role) {
  if (role === "admin") return "bg-gray-100 text-gray-800";
  if (role === "authority") return "bg-purple-100 text-purple-700";
  return "bg-blue-100 text-blue-700";
}

function badgeForStatus(status: Status) {
  if (status === "active") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
}

function roleLabel(role: Role) {
  if (role === "admin") return "Admin";
  if (role === "authority") return "Authority";
  return "Citizen";
}

type ModalMode = "create" | "edit";

type TabKey = "all" | "citizens" | "authorities";

type UserFormValues = {
  formMode: ModalMode;
  fullName: string;
  email: string;
  role: "authority" | "citizen";
  department?: string;
  status: Status;
  phone?: string;
  wardNumber?: string;
  municipality?: string;
  district?: string;
  tole?: string;
  dob?: string;
  citizenshipNumber?: string;
  password?: string;
};

const userFormSchema = z
  .object({
    formMode: z.enum(["create", "edit"]),
    fullName: z.string().min(2, "Enter full name"),
    email: z.string().email("Enter a valid email"),
    role: z.enum(["authority", "citizen"]),
    department: z.string().optional(),
    status: z.enum(["active", "suspended"]),
    phone: z.string().optional(),
    wardNumber: z.string().optional(),
    municipality: z.string().optional(),
    district: z.string().optional(),
    tole: z.string().optional(),
    dob: z.string().optional(),
    citizenshipNumber: z.string().optional(),
    password: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    const isAuthority = val.role === "authority";
    const isCitizen = val.role === "citizen";
    const isCreate = val.formMode === "create";

    if (isAuthority && !val.department?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["department"],
        message: "Department is required for authority accounts",
      });
    }

    const phone = (val.phone ?? "").trim();
    const ward = (val.wardNumber ?? "").trim();
    const municipality = (val.municipality ?? "").trim();
    const password = val.password ?? "";

    if ((isAuthority || isCitizen) && phone) {
      if (!/^(?:\d{10}|\+977\d{10})$/.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Phone must be 10 digits or +977 followed by 10 digits",
        });
      }
    }

    if (isCreate && (isAuthority || isCitizen)) {
      if (!/^(?:\d{10}|\+977\d{10})$/.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Phone must be 10 digits or +977 followed by 10 digits",
        });
      }

      if (!ward) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["wardNumber"],
          message: "Ward number is required",
        });
      }

      if (!municipality) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["municipality"],
          message: "Municipality is required",
        });
      }

      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must be at least 8 characters",
        });
      }
    }

    if (!isCreate && password) {
      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must be at least 8 characters",
        });
      }
    }
  });

export default function AdminUserManagementPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const pageSize = 10;

  const [tab, setTab] = useState<TabKey>("all");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalApiError, setModalApiError] = useState<string>("");
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      formMode: "create",
      fullName: "",
      email: "",
      role: "authority",
      department: "",
      status: "active",
      phone: "",
      wardNumber: "",
      municipality: "",
      district: "",
      tole: "",
      dob: "",
      citizenshipNumber: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const watchedRole = useWatch({ control, name: "role" });

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setLoadError("");
    try {
      const json = await adminListUsers({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
        tab,
      });
      setUsers(Array.isArray(json?.data) ? (json.data as AdminUserRow[]) : []);
      setPageMeta(json?.meta ?? null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoadError(msg || "Failed to load users");
      setUsers([]);
      setPageMeta(null);
    } finally {
      setLoadingUsers(false);
    }
  }, [page, pageSize, roleFilter, search, statusFilter, tab]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, search, statusFilter, tab]);

  const filteredUsers = users;

  const openCreateUser = () => {
    setModalMode("create");
    setEditingId(null);
    setModalApiError("");
    setModalLoading(false);
    reset({
      formMode: "create",
      fullName: "",
      email: "",
      role: "authority",
      department: "",
      status: "active",
      phone: "",
      wardNumber: "",
      municipality: "",
      district: "",
      tole: "",
      dob: "",
      citizenshipNumber: "",
      password: "",
    });
    setModalOpen(true);
  };

  const openEdit = async (row: AdminUserRow) => {
    if (row.role === "admin") {
      toast.info("Admin accounts cannot be edited from this screen.");
      return;
    }

    setModalMode("edit");
    setEditingId(row.id);
    setModalApiError("");
    setModalLoading(true);

    reset({
      formMode: "edit",
      fullName: row.fullName,
      email: row.email,
      role: row.role === "authority" ? "authority" : "citizen",
      department: row.department === "—" ? "" : (row.department ?? ""),
      status: row.status,
      phone: "",
      wardNumber: "",
      municipality: "",
      district: "",
      tole: "",
      dob: "",
      citizenshipNumber: "",
      password: "",
    });
    setModalOpen(true);

    try {
      if (row.role === "authority") {
        const detail = await adminGetAuthority(row.id);
        reset({
          formMode: "edit",
          fullName: detail.fullName ?? row.fullName,
          email: detail.email ?? row.email,
          role: "authority",
          department: detail.department ?? "",
          status: detail.status ?? row.status,
          phone: detail.phone ?? "",
          wardNumber: detail.wardNumber ?? "",
          municipality: detail.municipality ?? "",
          district: "",
          tole: "",
          dob: "",
          citizenshipNumber: "",
          password: "",
        });
      }

      if (row.role === "citizen") {
        const detail = await adminGetCitizen(row.id);
        reset({
          formMode: "edit",
          fullName: detail.fullName ?? row.fullName,
          email: detail.email ?? row.email,
          role: "citizen",
          department: "",
          status: detail.status ?? row.status,
          phone: detail.phone ?? "",
          wardNumber: detail.wardNumber ?? "",
          municipality: detail.municipality ?? "",
          district: detail.district ?? "",
          tole: detail.tole ?? "",
          dob: detail.dob ?? "",
          citizenshipNumber: detail.citizenshipNumber ?? "",
          password: "",
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setModalApiError(msg || "Failed to load user details");
      toast.error(msg || "Failed to load user details");
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => setModalOpen(false);

  const submit = async (values: UserFormValues) => {
    setModalApiError("");

    const trimmed = {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      status: values.status,
      phone: (values.phone ?? "").trim(),
      wardNumber: (values.wardNumber ?? "").trim(),
      municipality: (values.municipality ?? "").trim(),
      department: (values.department ?? "").trim(),
      district: (values.district ?? "").trim(),
      tole: (values.tole ?? "").trim(),
      dob: (values.dob ?? "").trim(),
      citizenshipNumber: (values.citizenshipNumber ?? "").trim(),
      password: values.password ?? "",
    };

    if (modalMode === "create" && values.role === "authority") {
      try {
        await adminCreateAuthority({
          fullName: trimmed.fullName,
          email: trimmed.email,
          password: trimmed.password,
          phone: trimmed.phone,
          wardNumber: trimmed.wardNumber,
          municipality: trimmed.municipality,
          department: trimmed.department,
          status: trimmed.status,
        });
        setModalOpen(false);
        setTab("authorities");
        await loadUsers();
        toast.success("Authority account created");
        return;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setModalApiError(msg || "Failed to create authority account");
        toast.error(msg || "Failed to create authority account");
        return;
      }
    }

    if (modalMode === "create" && values.role === "citizen") {
      try {
        await adminCreateCitizen({
          fullName: trimmed.fullName,
          email: trimmed.email,
          password: trimmed.password,
          phone: trimmed.phone,
          wardNumber: trimmed.wardNumber,
          municipality: trimmed.municipality,
          district: trimmed.district || undefined,
          tole: trimmed.tole || undefined,
          dob: trimmed.dob || undefined,
          citizenshipNumber: trimmed.citizenshipNumber || undefined,
          status: trimmed.status,
        });
        setModalOpen(false);
        setTab("citizens");
        await loadUsers();
        toast.success("Citizen account created");
        return;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setModalApiError(msg || "Failed to create citizen account");
        toast.error(msg || "Failed to create citizen account");
        return;
      }
    }

    if (modalMode === "edit") {
      if (!editingId) {
        setModalApiError("Missing user id");
        return;
      }

      try {
        if (values.role === "authority") {
          await adminUpdateAuthority(editingId, {
            fullName: trimmed.fullName,
            email: trimmed.email,
            status: trimmed.status,
            department: trimmed.department,
            wardNumber: trimmed.wardNumber,
            municipality: trimmed.municipality,
            ...(trimmed.phone ? { phone: trimmed.phone } : {}),
            ...(trimmed.password ? { password: trimmed.password } : {}),
          });
        }

        if (values.role === "citizen") {
          await adminUpdateCitizen(editingId, {
            fullName: trimmed.fullName,
            email: trimmed.email,
            status: trimmed.status,
            wardNumber: trimmed.wardNumber,
            municipality: trimmed.municipality,
            district: trimmed.district || undefined,
            tole: trimmed.tole || undefined,
            dob: trimmed.dob || undefined,
            citizenshipNumber: trimmed.citizenshipNumber || undefined,
            ...(trimmed.phone ? { phone: trimmed.phone } : {}),
            ...(trimmed.password ? { password: trimmed.password } : {}),
          });
        }

        setModalOpen(false);
        await loadUsers();
        toast.success("User updated");
        return;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setModalApiError(msg || "Failed to update user");
        toast.error(msg || "Failed to update user");
        return;
      }
    }

    setModalApiError("Unsupported action");
  };

  const removeUser = async (row: AdminUserRow) => {
    if (row.role === "admin") {
      toast.info("Admin accounts cannot be deleted from this screen.");
      return;
    }

    const ok = window.confirm(`Delete user ${row.fullName}? This cannot be undone.`);
    if (!ok) return;

    try {
      if (row.role === "authority") await adminDeleteAuthority(row.id);
      if (row.role === "citizen") await adminDeleteCitizen(row.id);
      await loadUsers();
      toast.success("User deleted");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">Manage citizen and authority accounts</p>
        </div>

        <button
          type="button"
          onClick={openCreateUser}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      <div className="inline-flex rounded-lg bg-gray-100 p-1">
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>All Users</TabButton>
        <TabButton active={tab === "citizens"} onClick={() => setTab("citizens")}>Citizens</TabButton>
        <TabButton active={tab === "authorities"} onClick={() => setTab("authorities")}>Authorities</TabButton>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="h-10 w-full pl-9 pr-3 rounded-md border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 lg:w-[360px]">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
              className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="authority">Authority</option>
              <option value="citizen">Citizen</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
              className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="all">All Status</option>
              <option value="active">All Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-white text-gray-600 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Last Active</th>
                <th className="px-4 py-3 font-semibold">Activity</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loadingUsers ? (
                <tr>
                  <td colSpan={8} className="px-4 py-14">
                    <div className="flex items-center justify-center gap-3 text-gray-600">
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-emerald-600 animate-spin" />
                      <span className="text-sm">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="text-sm text-red-600">{loadError}</div>
                    <button
                      type="button"
                      onClick={() => void loadUsers()}
                      className="mt-3 inline-flex items-center justify-center h-9 px-4 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-800"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {resolveProfilePhotoUrl(u.profilePhoto) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveProfilePhotoUrl(u.profilePhoto)}
                              alt={u.fullName}
                              className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                              {initialsFromName(u.fullName)}
                            </div>
                          )}

                          <div className="leading-tight min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{u.fullName}</div>
                            <div className="text-sm text-gray-500 truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeForRole(u.role)}`}>
                          {roleLabel(u.role)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-700">{u.department || "—"}</td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeForStatus(u.status)}`}>
                          {u.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-700">{u.joinedDate}</td>
                      <td className="px-4 py-3 text-gray-700">{u.lastActive}</td>
                      <td className="px-4 py-3 text-gray-700">{u.activity}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => void openEdit(u)}
                            aria-label="Edit"
                            disabled={u.role === "admin"}
                            title={u.role === "admin" ? "Admin accounts cannot be edited" : "Edit"}
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeUser(u)}
                            aria-label="Delete"
                            disabled={u.role === "admin"}
                            title={u.role === "admin" ? "Admin accounts cannot be deleted" : "Delete"}
                            className="text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {pageMeta && pageMeta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold text-gray-900">{pageMeta.page}</span> of {pageMeta.totalPages}
              <span className="mx-2 text-gray-300">•</span>
              Showing {(pageMeta.page - 1) * pageMeta.limit + 1}–{Math.min(pageMeta.page * pageMeta.limit, pageMeta.total)} of {pageMeta.total}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageMeta.page <= 1}
                className="h-9 px-3 rounded-full border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>

              <div className="h-9 px-3 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-800 flex items-center">
                {pageMeta.page}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageMeta.totalPages, p + 1))}
                disabled={pageMeta.page >= pageMeta.totalPages}
                className="h-9 px-3 rounded-full border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} aria-hidden="true" />

          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{modalMode === "create" ? "Create User" : "Edit User"}</div>
                    <div className="text-sm text-gray-500">
                      {modalMode === "create" ? "Add an authority or citizen account" : "Update account details"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-9 h-9 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit(submit)} className="p-6 space-y-4">
                {modalLoading && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-emerald-600 animate-spin" />
                    <span>Loading details…</span>
                  </div>
                )}

                {modalApiError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{modalApiError}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      {...register("fullName")}
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                      placeholder="Full name"
                    />
                    {errors.fullName?.message ? <div className="text-xs text-red-600 mt-1">{String(errors.fullName.message)}</div> : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      {...register("email")}
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                      placeholder="Email"
                    />
                    {errors.email?.message ? <div className="text-xs text-red-600 mt-1">{String(errors.email.message)}</div> : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <select
                      {...register("role")}
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="authority">Authority</option>
                      <option value="citizen">Citizen</option>
                    </select>
                    {errors.role?.message ? <div className="text-xs text-red-600 mt-1">{String(errors.role.message)}</div> : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      {...register("status")}
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    {errors.status?.message ? <div className="text-xs text-red-600 mt-1">{String(errors.status.message)}</div> : null}
                  </div>
                </div>

                {watchedRole === "authority" ? (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <input
                      {...register("department")}
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                      placeholder="Department"
                    />
                    {errors.department?.message ? (
                      <div className="text-xs text-red-600 mt-1">{String(errors.department.message)}</div>
                    ) : null}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <input
                      {...register("phone")}
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                      placeholder="98XXXXXXXX"
                    />
                    {errors.phone?.message ? <div className="text-xs text-red-600 mt-1">{String(errors.phone.message)}</div> : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ward</label>
                    <input
                      {...register("wardNumber")}
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                      placeholder="Ward"
                    />
                    {errors.wardNumber?.message ? <div className="text-xs text-red-600 mt-1">{String(errors.wardNumber.message)}</div> : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Municipality</label>
                    <input
                      {...register("municipality")}
                      className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                      placeholder="Municipality"
                    />
                    {errors.municipality?.message ? <div className="text-xs text-red-600 mt-1">{String(errors.municipality.message)}</div> : null}
                  </div>
                </div>

                {watchedRole === "citizen" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">District</label>
                      <input
                        {...register("district")}
                        className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                        placeholder="District"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tole</label>
                      <input
                        {...register("tole")}
                        className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                        placeholder="Tole"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">DOB</label>
                      <input
                        {...register("dob")}
                        className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                        placeholder="YYYY-MM-DD"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Citizenship No.</label>
                      <input
                        {...register("citizenshipNumber")}
                        className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                        placeholder="Citizenship Number"
                      />
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password {modalMode === "edit" ? "(optional)" : ""}
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                    placeholder={modalMode === "create" ? "At least 8 characters" : "Leave blank to keep unchanged"}
                  />
                  {errors.password?.message ? <div className="text-xs text-red-600 mt-1">{String(errors.password.message)}</div> : null}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-10 px-4 rounded-md border border-gray-200 bg-white hover:bg-gray-50 font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="h-10 px-4 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {modalMode === "create" ? "Create" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* small spacer to match screenshot whitespace */}
      <div className="h-10" />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-3 py-1.5 text-sm font-semibold rounded-md transition-colors " +
        (active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900")
      }
    >
      {children}
    </button>
  );
}
