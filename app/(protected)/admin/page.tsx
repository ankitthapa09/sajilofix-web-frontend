"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  Pencil,
  Plus,
  Shield,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
  AlertCircle,
  ArrowRight,
  CircleDot,
  TrendingUp,
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
import { listAuthorityIssues, type IssueListItem } from "@/lib/api/issues";
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
  joinedDate: string; // YYYY-MM-DD
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

type IssueStatus = "pending" | "in_progress" | "resolved" | "rejected";
type RecentIssue = {
  id: string;
  title: string;
  location: string;
  status: IssueStatus;
};

function issueBadge(status: IssueStatus) {
  if (status === "pending") return "bg-orange-100 text-orange-700";
  if (status === "in_progress") return "bg-blue-100 text-blue-700";
  if (status === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-emerald-100 text-emerald-700";
}

function formatIssueLocation(issue: IssueListItem) {
  const parts = [
    issue.location?.address,
    issue.location?.ward ? `Ward ${issue.location.ward}` : "",
    issue.location?.municipality,
    issue.location?.district,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "Unknown location";
}

const userFormSchema = z
  .object({
    formMode: z.enum(["create", "edit"]),
    fullName: z.string().min(2, "Enter full name"),
    email: z.string().email("Enter a valid email"),
    role: z.enum(["authority", "citizen"]),
    department: z.string().optional(),
    status: z.enum(["active", "suspended"]),

    // Contact + location (required on create)
    phone: z.string().optional(),
    wardNumber: z.string().optional(),
    municipality: z.string().optional(),

    // Citizen-only extras
    district: z.string().optional(),
    tole: z.string().optional(),
    dob: z.string().optional(),
    citizenshipNumber: z.string().optional(),

    // Required on create (authority/citizen), optional on edit
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

type UserFormValues = z.infer<typeof userFormSchema>;

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

type ModalMode = "create" | "edit";

type SelectedUser = {
  fullName?: string;
  email?: string;
  role?: Role;
  status?: Status;
  profilePhoto?: string;
  department?: string;
  phone?: string;
  wardNumber?: string;
  municipality?: string;
  district?: string;
  tole?: string;
  dob?: string;
  citizenshipNumber?: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [page, setPage] = useState(1);
  const [pageMeta, setPageMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const pageSize = 8;
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalApiError, setModalApiError] = useState<string>("");
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

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
        role: roleFilter,
        status: statusFilter,
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
  }, [page, pageSize, roleFilter, statusFilter]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    let isMounted = true;

    listAuthorityIssues()
      .then((data) => {
        if (!isMounted) return;
        setIssues(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setIssues([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingIssues(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalUsers = pageMeta?.total ?? users.length;
    const citizens = users.filter((u) => u.role === "citizen").length;
    const authorities = users.filter((u) => u.role === "authority").length;
    const active = users.filter((u) => u.status === "active").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    return { totalUsers, citizens, authorities, active, suspended };
  }, [users, pageMeta?.total]);

  const recentUsers = useMemo(() => {
    return [...users]
      .filter((u) => u.role !== "admin")
      .sort((a, b) => (a.joinedDate < b.joinedDate ? 1 : -1))
      .slice(0, 5);
  }, [users]);

  const recentIssues = useMemo<RecentIssue[]>(() => {
    return [...issues]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((issue) => ({
        id: issue.id,
        title: issue.title,
        location: formatIssueLocation(issue),
        status: issue.status as IssueStatus,
      }));
  }, [issues]);

  const issueStats = useMemo(() => {
    const total = issues.length;
    const pending = issues.filter((i) => i.status === "pending").length;
    const resolved = issues.filter((i) => i.status === "resolved").length;
    const inProgress = issues.filter((i) => i.status === "in_progress").length;
    const urgent = issues.filter((i) => i.urgency === "urgent" && i.status !== "resolved").length;
    return { total, pending, urgent, resolved, inProgress };
  }, [issues]);

  const resolvedRate = issueStats.total > 0 ? Math.round((issueStats.resolved / issueStats.total) * 100) : 0;

  const filteredUsers = useMemo(() => users, [users]);

  const openCreate = (role: "authority" | "citizen") => {
    setModalMode("create");
    setEditingId(null);
    setModalApiError("");
    setModalLoading(false);
    setSelectedUser(null);
    reset({
      formMode: "create",
      fullName: "",
      email: "",
      role,
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

  const openCreateUser = () => openCreate("authority");

  const openEdit = async (row: AdminUserRow) => {
    if (row.role === "admin") {
      toast.info("Admin accounts cannot be edited from this screen.");
      return;
    }

    setModalMode("edit");
    setEditingId(row.id);
    setModalApiError("");
    setModalLoading(true);
    setSelectedUser({
      fullName: row.fullName,
      email: row.email,
      role: row.role,
      status: row.status,
      profilePhoto: row.profilePhoto,
      department: row.department === "—" ? "" : (row.department ?? ""),
    });

    
    reset({
      formMode: "edit",
      fullName: row.fullName,
      email: row.email,
      role: row.role,
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
        setSelectedUser({
          fullName: detail.fullName ?? row.fullName,
          email: detail.email ?? row.email,
          role: "authority",
          status: detail.status ?? row.status,
          profilePhoto: detail.profilePhoto,
          department: detail.department ?? "",
          phone: detail.phone,
          wardNumber: detail.wardNumber,
          municipality: detail.municipality,
        });
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
        setSelectedUser({
          fullName: detail.fullName ?? row.fullName,
          email: detail.email ?? row.email,
          role: "citizen",
          status: detail.status ?? row.status,
          profilePhoto: detail.profilePhoto,
          phone: detail.phone,
          wardNumber: detail.wardNumber,
          municipality: detail.municipality,
          district: detail.district,
          tole: detail.tole,
          dob: detail.dob,
          citizenshipNumber: detail.citizenshipNumber,
        });
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

  const closeModal = () => {
    setModalOpen(false);
  };

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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TopStatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              +12% from last month
            </span>
          }
          tone="green"
          icon={<Users className="w-5 h-5" />}
        />
        <TopStatCard
          title="Total Issues"
          value={issueStats.total}
          subtitle={
            <span className="inline-flex items-center gap-1.5">
              <CircleDot className="w-4 h-4" />
              {issueStats.pending} pending
            </span>
          }
          tone="blue"
          icon={<FileText className="w-5 h-5" />}
        />
        <TopStatCard
          title="Urgent Issues"
          value={issueStats.urgent}
          subtitle={
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Requires attention
            </span>
          }
          tone="orange"
          icon={<AlertCircle className="w-5 h-5" />}
        />
        <TopStatCard
          title="Resolved"
          value={issueStats.resolved}
          subtitle={
            <span className="inline-flex items-center gap-1.5">
              <CircleDot className="w-4 h-4" />
              {resolvedRate}% completion rate
            </span>
          }
          tone="emerald"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Secondary mini cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniStatCard
          title="Citizens"
          value={stats.citizens}
          tone="blue"
          icon={<UserCheck className="w-5 h-5" />}
        />
        <MiniStatCard
          title="Authorities"
          value={stats.authorities}
          tone="purple"
          icon={<Shield className="w-5 h-5" />}
        />
        <MiniStatCard
          title="In Progress"
          value={issueStats.inProgress}
          tone="orange"
          icon={<Clock3 className="w-5 h-5" />}
        />
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section id="issues" className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Issues</h2>
            <Link href="/admin/issue-management" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {loadingIssues ? (
              <div className="text-sm text-gray-500">Loading recent issues...</div>
            ) : recentIssues.length ? (
              recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{issue.title}</div>
                    <div className="text-sm text-gray-500 truncate">{issue.location}</div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${issueBadge(issue.status)}`}>
                    {issue.status.replace(/_/g, " ")}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No issues found.</div>
            )}
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
            <Link href="/admin/user-management" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-6 space-y-3">
            {recentUsers.length === 0 ? (
              <div className="text-sm text-gray-500">No users yet.</div>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {resolveProfilePhotoUrl(u.profilePhoto) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveProfilePhotoUrl(u.profilePhoto)}
                        alt={u.fullName}
                        className="w-10 h-10 rounded-full object-cover bg-white border border-gray-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                        {initialsFromName(u.fullName)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{u.fullName}</div>
                      <div className="text-sm text-gray-500 truncate">{u.email}</div>
                    </div>
                  </div>

                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeForRole(u.role)}`}>
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* User Management */}
      <section id="users" className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-500">Create users, edit details, and manage access</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCreateUser}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New User
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3 lg:flex-row lg:items-center">
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
                            {resolveProfilePhotoUrl(u.profilePhoto) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={resolveProfilePhotoUrl(u.profilePhoto)}
                                alt={u.fullName}
                                className="w-9 h-9 rounded-full object-cover bg-gray-100 border border-gray-200"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User className="w-4 h-4" />
                              </div>
                            )}
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
                              onClick={() => void openEdit(u)}
                              aria-label="Edit"
                              disabled={u.role === "admin"}
                              title={u.role === "admin" ? "Admin accounts cannot be edited" : "Edit"}
                              className="w-9 h-9 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Pencil className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void removeUser(u)}
                              aria-label="Delete"
                              disabled={u.role === "admin"}
                              title={u.role === "admin" ? "Admin accounts cannot be deleted" : "Delete"}
                              className="w-9 h-9 rounded-md border border-gray-200 bg-white hover:bg-red-50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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

          {pageMeta && pageMeta.total > pageMeta.limit && (
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
      </section>

      {/* Create/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-start justify-center px-4 py-6 overflow-y-auto">
            <div className="w-full max-w-lg max-h-[90vh] bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
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

              <form onSubmit={handleSubmit(submit)} className="p-6 space-y-4 overflow-y-auto">
                {modalLoading && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-green-600 animate-spin" />
                    <span>Loading details…</span>
                  </div>
                )}
                {modalApiError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {modalApiError}
                  </div>
                )}

                {modalMode === "edit" && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {resolveProfilePhotoUrl(selectedUser?.profilePhoto) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveProfilePhotoUrl(selectedUser?.profilePhoto)}
                          alt={selectedUser?.fullName || "User"}
                          className="w-14 h-14 rounded-full object-cover border border-gray-200 bg-white"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                          {initialsFromName(selectedUser?.fullName || "")}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="text-sm text-gray-500">Profile</div>
                        <div className="text-lg font-semibold text-gray-900 truncate">
                          {selectedUser?.fullName || "—"}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {selectedUser?.email || "—"}
                        </div>
                      </div>

                      <div className="sm:ml-auto flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeForRole(selectedUser?.role || "citizen")}`}>
                          {roleLabel(selectedUser?.role || "citizen")}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeForStatus(selectedUser?.status || "active")}`}>
                          {selectedUser?.status === "suspended" ? "Suspended" : "Active"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-700">
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="font-medium">{selectedUser?.phone || "—"}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Ward</div>
                        <div className="font-medium">{selectedUser?.wardNumber || "—"}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Municipality</div>
                        <div className="font-medium">{selectedUser?.municipality || "—"}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">District</div>
                        <div className="font-medium">{selectedUser?.district || "—"}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Tole</div>
                        <div className="font-medium">{selectedUser?.tole || "—"}</div>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                        <div className="text-xs text-gray-500">Citizenship No.</div>
                        <div className="font-medium">{selectedUser?.citizenshipNumber || "—"}</div>
                      </div>
                    </div>
                  </div>
                )}
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
                      disabled={modalMode === "edit"}
                    >
                      <option value="authority">Authority</option>
                      <option value="citizen">Citizen</option>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="phone">
                      Phone{modalMode === "create" ? <span className="text-red-600"> *</span> : <span className="text-gray-500"> (optional)</span>}
                    </label>
                    <input
                      id="phone"
                      className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-green-200"
                      {...register("phone")}
                      placeholder="9800000000 or +9779800000000"
                    />
                    {errors.phone?.message && (
                      <p className="text-xs text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="password">
                      Password{modalMode === "create" ? <span className="text-red-600"> *</span> : <span className="text-gray-500"> (leave blank to keep)</span>}
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-green-200"
                      {...register("password")}
                      placeholder={modalMode === "create" ? "At least 8 characters" : "New password (optional)"}
                    />
                    {errors.password?.message && (
                      <p className="text-xs text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="wardNumber">
                      Ward Number{modalMode === "create" ? <span className="text-red-600"> *</span> : null}
                    </label>
                    <input
                      id="wardNumber"
                      className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-green-200"
                      {...register("wardNumber")}
                      placeholder="e.g. 5"
                    />
                    {errors.wardNumber?.message && (
                      <p className="text-xs text-red-600">{errors.wardNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="municipality">
                      Municipality{modalMode === "create" ? <span className="text-red-600"> *</span> : null}
                    </label>
                    <input
                      id="municipality"
                      className="h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-green-200"
                      {...register("municipality")}
                      placeholder="e.g. Kathmandu"
                    />
                    {errors.municipality?.message && (
                      <p className="text-xs text-red-600">{errors.municipality.message}</p>
                    )}
                  </div>
                </div>

                {watchedRole === "citizen" && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="text-sm font-semibold text-gray-900">Citizen Details</div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-900" htmlFor="district">
                          District <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                          id="district"
                          className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 outline-none focus:ring-2 focus:ring-green-200"
                          {...register("district")}
                          placeholder="e.g. Kathmandu"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-900" htmlFor="tole">
                          Tole <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                          id="tole"
                          className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 outline-none focus:ring-2 focus:ring-green-200"
                          {...register("tole")}
                          placeholder="e.g. Baneshwor"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-900" htmlFor="dob">
                          Date of Birth <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                          id="dob"
                          className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 outline-none focus:ring-2 focus:ring-green-200"
                          {...register("dob")}
                          placeholder="YYYY-MM-DD"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-900" htmlFor="citizenshipNumber">
                          Citizenship No. <span className="text-gray-500">(optional)</span>
                        </label>
                        <input
                          id="citizenshipNumber"
                          className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 outline-none focus:ring-2 focus:ring-green-200"
                          {...register("citizenshipNumber")}
                          placeholder="e.g. 123-456-789"
                        />
                      </div>
                    </div>
                  </div>
                )}

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
    <div
      className={
        "group bg-white border border-gray-200 rounded-2xl shadow-sm p-5 border-l-4 transition-all hover:-translate-y-0.5 hover:shadow-md " +
        accent
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900 tracking-tight">{value}</div>
          <div className="mt-2 h-1.5 w-24 rounded-full bg-linear-to-r from-gray-200 via-gray-100 to-transparent" />
        </div>
        <div className="transition-transform group-hover:scale-[1.03]">{icon}</div>
      </div>
    </div>
  );
}

function TopStatCard({
  title,
  value,
  subtitle,
  tone,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  subtitle: React.ReactNode;
  tone: "green" | "blue" | "orange" | "emerald";
  icon: React.ReactNode;
}) {
  const toneStyles =
    tone === "green"
      ? "bg-[#4F46E5]"
      : tone === "blue"
        ? "bg-[#7C3AED]"
        : tone === "orange"
          ? "bg-[#E11D48]"
          : "bg-[#047857]";

  return (
    <div
      className={
        `${toneStyles} text-white rounded-2xl shadow-md border border-black/5 p-5 min-h-27.5 ` +
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white/90">{title}</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
          <div className="mt-2 text-sm text-white/90">{subtitle}</div>
        </div> 
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniStatCard({
  title,
  value,
  tone,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  tone: "blue" | "purple" | "orange";
  icon: React.ReactNode;
}) {
  const toneBorder = tone === "blue" ? "border-l-blue-500" : tone === "purple" ? "border-l-purple-500" : "border-l-orange-500";
  const toneChip =
    tone === "blue"
      ? "bg-blue-50 text-blue-700"
      : tone === "purple"
        ? "bg-purple-50 text-purple-700"
        : "bg-orange-50 text-orange-700";

  return (
    <div
      className={
        `group bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 border-l-4 ${toneBorder} ` +
        "transition-colors hover:border-gray-300"
      }
    >
      <div className="flex items-center gap-4">
        <div
          className={
            `w-12 h-12 rounded-xl flex items-center justify-center ${toneChip} border border-gray-100`
          }
        >
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-semibold text-gray-900">{value}</div>
        </div>
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
