"use client";

import React, { useMemo } from "react";
import { Eye } from "lucide-react";

type IssueStatus = "pending" | "in-progress" | "resolved";
type Priority = "low" | "medium" | "high" | "urgent";

type IssueRow = {
  id: string;
  issue: string;
  category: string;
  location: string;
  priority: Priority;
  status: IssueStatus;
  reportedBy: string;
  date: string;
};

function badgeForStatus(status: IssueStatus) {
  if (status === "pending") return "bg-orange-100 text-orange-700";
  if (status === "in-progress") return "bg-blue-100 text-blue-700";
  return "bg-emerald-100 text-emerald-700";
}

function badgeForPriority(priority: Priority) {
  if (priority === "urgent") return "bg-red-100 text-red-700";
  if (priority === "high") return "bg-orange-100 text-orange-700";
  if (priority === "medium") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
}

function StatCard({
  title,
  value,
  accent,
  badge,
}: {
  title: string;
  value: number;
  accent: string;
  badge?: string;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 border-l-4 ${accent}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
        </div>
        {badge ? (
          <span className="mt-0.5 inline-flex items-center rounded-full bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 text-[11px] font-semibold">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminIssueManagementPage() {
  const issues = useMemo<IssueRow[]>(() => {
    // Placeholder until issue APIs are connected.
    return [
      {
        id: "i1",
        issue: "Broken Street Light",
        category: "Street Lights",
        location: "Thamel, Ward 26",
        priority: "high",
        status: "pending",
        reportedBy: "Ramesh Sharma",
        date: "2024-02-01",
      },
      {
        id: "i2",
        issue: "Pothole on Main Road",
        category: "Roads & Potholes",
        location: "New Baneshwor",
        priority: "urgent",
        status: "in-progress",
        reportedBy: "Sita Thapa",
        date: "2024-01-28",
      },
      {
        id: "i3",
        issue: "Garbage Overflow",
        category: "Waste Management",
        location: "Lazimpat",
        priority: "medium",
        status: "resolved",
        reportedBy: "Hari Bahadur",
        date: "2024-01-25",
      },
    ];
  }, []);

  const stats = useMemo(() => {
    const total = issues.length;
    const pending = issues.filter((i) => i.status === "pending").length;
    const inProgress = issues.filter((i) => i.status === "in-progress").length;
    const resolved = issues.filter((i) => i.status === "resolved").length;
    return { total, pending, inProgress, resolved };
  }, [issues]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Issue Management</h2>
        <p className="text-sm text-gray-500">Monitor and manage all reported issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Issues" value={stats.total} accent="border-slate-400" badge="Preview" />
        <StatCard title="Pending" value={stats.pending} accent="border-orange-500" />
        <StatCard title="In Progress" value={stats.inProgress} accent="border-blue-600" />
        <StatCard title="Resolved" value={stats.resolved} accent="border-emerald-500" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-245 w-full text-sm">
            <thead className="bg-white text-gray-600 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Issue</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Reported By</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {issues.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{row.issue}</td>
                  <td className="px-4 py-3 text-gray-700">{row.category}</td>
                  <td className="px-4 py-3 text-gray-700">{row.location}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeForPriority(row.priority)}`}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeForStatus(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.reportedBy}</td>
                  <td className="px-4 py-3 text-gray-700">{row.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button type="button" aria-label="View" className="text-gray-600 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
