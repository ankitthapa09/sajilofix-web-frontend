"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

type Role = "admin" | "authority" | "citizen";
type Status = "active" | "suspended";

type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  department?: string;
  status: Status;
  joinedDate: string; // YYYY-MM-DD
  lastActive: string;
  activity: string;
};

const userFormSchema = z
  .object({
    fullName: z.string().min(2, "Enter full name"),
    email: z.string().email("Enter a valid email"),
    role: z.enum(["admin", "authority", "citizen"]),
    department: z.string().optional(),
    status: z.enum(["active", "suspended"]),
  })
  .superRefine((val, ctx) => {
    if (val.role === "authority" && !val.department?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["department"],
        message: "Department is required for authority accounts",
      });
    }
  });

type UserFormValues = z.infer<typeof userFormSchema>;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function roleLabel(role: Role) {
  if (role === "admin") return "Admin";
  if (role === "authority") return "Authority";
  return "Citizen";
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

type TabKey = "all" | "citizens" | "authorities";

type ListUsersResponse = {
  success: boolean;
  data: AdminUserRow[];
};

type ModalMode = "create" | "edit";

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "authority",
      department: "",
      status: "active",
    },
    mode: "onSubmit",
  });

  const watchedRole = useWatch({ control, name: "role" });

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setLoadError("");
    try {
      const resp = await fetch("/api/admin/users", { cache: "no-store" });
      const json = (await resp.json()) as Partial<ListUsersResponse> & { message?: string };

      if (!resp.ok) {
        throw new Error(json?.message ?? "Failed to load users");
      }

      setUsers(Array.isArray(json?.data) ? (json.data as AdminUserRow[]) : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoadError(msg || "Failed to load users");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const citizens = users.filter((u) => u.role === "citizen").length;
    const authorities = users.filter((u) => u.role === "authority").length;
    const active = users.filter((u) => u.status === "active").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    return { totalUsers, citizens, authorities, active, suspended };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users
      .filter((u) => {
        if (tab === "citizens" && u.role !== "citizen") return false;
        if (tab === "authorities" && u.role !== "authority") return false;
        return true;
      })
      .filter((u) => {
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        if (statusFilter !== "all" && u.status !== statusFilter) return false;
        return true;
      })
      .filter((u) => {
        if (!q) return true;
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        );
      });
  }, [roleFilter, search, statusFilter, tab, users]);

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    reset({
      fullName: "",
      email: "",
      role: "authority",
      department: "",
      status: "active",
    });
    setModalOpen(true);
  };

  const openEdit = (row: AdminUserRow) => {
    setModalMode("edit");
    setEditingId(row.id);
    reset({
      fullName: row.fullName,
      email: row.email,
      role: row.role,
      department: row.department === "—" ? "" : (row.department ?? ""),
      status: row.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const submit = async (values: UserFormValues) => {
    const department = values.role === "authority" ? values.department?.trim() : "";
    const normalized: AdminUserRow = {
      id: editingId ?? `u_${uid()}`,
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      department: values.role === "authority" ? (department || "—") : "—",
      status: values.status,
      joinedDate:
        modalMode === "edit"
          ? (users.find((u) => u.id === editingId)?.joinedDate ?? new Date().toISOString().slice(0, 10))
          : new Date().toISOString().slice(0, 10),
      lastActive: "just now",
      activity: values.role === "authority" ? "0 resolved" : "0 reports",
    };

    if (modalMode === "create") {
      setUsers((prev) => [normalized, ...prev]);
      setTab(values.role === "authority" ? "authorities" : values.role === "citizen" ? "citizens" : "all");
    } else {
      setUsers((prev) => prev.map((u) => (u.id === normalized.id ? { ...u, ...normalized } : u)));
    }

    setModalOpen(false);
  };

  const removeUser = (row: AdminUserRow) => {
    const ok = window.confirm(`Delete user ${row.fullName}?`);
    if (!ok) return;
    setUsers((prev) => prev.filter((u) => u.id !== row.id));
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Users"
          value={stats.totalUsers}
          accent="border-l-green-500"
          icon={
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          }
        />
        <SummaryCard
          title="Citizens"
          value={stats.citizens}
          accent="border-l-blue-500"
          icon={
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          }
        />
        <SummaryCard
          title="Authorities"
          value={stats.authorities}
          accent="border-l-purple-500"
          icon={
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          }
        />
        <SummaryCard
          title="Active / Suspended"
          value={`${stats.active} / ${stats.suspended}`}
          accent="border-l-orange-500"
          icon={
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <UserX className="w-5 h-5" />
            </div>
          }
        />
      </div>

      {/* System Statistics */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="text-green-600">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-gray-900">System Statistics</h2>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatPill
            label="Total Reports"
            value={267}
            icon={<FileText className="w-4 h-4 text-gray-600" />}
          />
          <StatPill
            label="Pending"
            value={43}
            icon={<Clock3 className="w-4 h-4 text-orange-600" />}
          />
          <StatPill
            label="Resolved"
            value={224}
            icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
          />
        </div>
      </section>

      {/* User Management */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-green-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-500">Create authority accounts and manage users</p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New User
          </button>
        </div>

        <div className="px-6 pt-5">
          {/* Tabs */}
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <TabButton active={tab === "all"} onClick={() => setTab("all")}>All Users</TabButton>
            <TabButton active={tab === "citizens"} onClick={() => setTab("citizens")}>Citizens</TabButton>
            <TabButton active={tab === "authorities"} onClick={() => setTab("authorities")}>Authorities</TabButton>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="h-10 w-full pl-9 pr-3 rounded-md border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="min-w-44">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
                className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="authority">Authority</option>
                <option value="citizen">Citizen</option>
              </select>
            </div>
            <div className="min-w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
                className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-245 w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Joined Date</th>
                  <th className="px-4 py-3 font-semibold">Last Active</th>
                  <th className="px-4 py-3 font-semibold">Activity</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14">
                      <div className="flex items-center justify-center gap-3 text-gray-600">
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-green-600 animate-spin" />
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
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="leading-tight">
                              <div className="font-semibold text-gray-900">{u.fullName}</div>
                              <div className="text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${badgeForRole(u.role)}`}>
                            {roleLabel(u.role)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-gray-700">{u.department || "—"}</td>

                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${badgeForStatus(u.status)}`}>
                            {u.status === "active" ? "Active" : "Suspended"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-gray-700">{u.joinedDate}</td>
                        <td className="px-4 py-3 text-gray-700">{u.lastActive}</td>
                        <td className="px-4 py-3 text-gray-700">{u.activity}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(u)}
                              aria-label="Edit"
                              className="w-9 h-9 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
                            >
                              <Pencil className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeUser(u)}
                              aria-label="Delete"
                              className="w-9 h-9 rounded-md border border-gray-200 bg-white hover:bg-red-50 flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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
        </div>
      </section>

      {/* Create/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {modalMode === "create" ? "Create New User" : "Edit User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {modalMode === "create" ? "Add an authority/citizen/admin account" : "Update account details"}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="fullName">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-green-200"
                      {...register("fullName")}
                      placeholder="e.g. Kathmandu Municipality"
                    />
                    {errors.fullName?.message && (
                      <p className="text-xs text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-green-200"
                      {...register("email")}
                      placeholder="e.g. dept@sajilofix.gov.np"
                    />
                    {errors.email?.message && (
                      <p className="text-xs text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="role">
                      Role
                    </label>
                    <select
                      id="role"
                      className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:ring-2 focus:ring-green-200"
                      {...register("role")}
                    >
                      <option value="authority">Authority</option>
                      <option value="citizen">Citizen</option>
                      <option value="admin">Admin</option>
                    </select>
                    {errors.role?.message && (
                      <p className="text-xs text-red-600">{errors.role.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="status">
                      Status
                    </label>
                    <select
                      id="status"
                      className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:ring-2 focus:ring-green-200"
                      {...register("status")}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    {errors.status?.message && (
                      <p className="text-xs text-red-600">{errors.status.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900" htmlFor="department">
                    Department
                    {watchedRole === "authority" ? (
                      <span className="text-red-600"> *</span>
                    ) : (
                      <span className="text-gray-500"> (optional)</span>
                    )}
                  </label>
                  <input
                    id="department"
                    className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-green-200 disabled:opacity-60"
                    {...register("department")}
                    placeholder={watchedRole === "authority" ? "e.g. Public Works" : "—"}
                    disabled={watchedRole !== "authority"}
                  />
                  {errors.department?.message && (
                    <p className="text-xs text-red-600">{errors.department.message}</p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-10 px-4 rounded-md border border-gray-200 bg-white hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 px-4 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                  >
                    {modalMode === "create" ? "Create" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  accent,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-5 border-l-4 ${accent}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
        </div>
        {icon}
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
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
