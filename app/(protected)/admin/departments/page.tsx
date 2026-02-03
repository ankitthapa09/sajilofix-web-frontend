"use client";

import React, { useMemo, useState } from "react";
import { Building2, Plus, Trash2, X } from "lucide-react";

type DepartmentCard = {
  id: string;
  name: string;
  description: string;
  authorities: number;
  activeIssues: number;
};

export default function AdminDepartmentsPage() {
  const seed = useMemo<DepartmentCard[]>(
    () => [
      {
        id: "d1",
        name: "Public Works",
        description: "Responsible for road maintenance, infrastructure, and public facilities",
        authorities: 5,
        activeIssues: 23,
      },
      {
        id: "d2",
        name: "Traffic Management",
        description: "Manages traffic control, parking, and road safety",
        authorities: 3,
        activeIssues: 12,
      },
      {
        id: "d3",
        name: "Waste Management",
        description: "Handles garbage collection and waste disposal services",
        authorities: 4,
        activeIssues: 8,
      },
    ],
    [],
  );

  const [departments, setDepartments] = useState<DepartmentCard[]>(seed);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const removeDepartment = (id: string) => {
    const dept = departments.find((d) => d.id === id);
    const ok = window.confirm(`Delete department ${dept?.name ?? ""}?`);
    if (!ok) return;
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const createDepartment = () => {
    const name = newName.trim();
    const description = newDesc.trim();
    if (!name) return;

    setDepartments((prev) => [
      {
        id: `d_${Date.now()}`,
        name,
        description: description || "—",
        authorities: 0,
        activeIssues: 0,
      },
      ...prev,
    ]);

    setNewName("");
    setNewDesc("");
    setCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Department Management</h2>
          <p className="text-sm text-gray-500">Manage authority departments and assignments</p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments.map((d) => (
          <div key={d.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                </div>

                <button
                  type="button"
                  onClick={() => removeDepartment(d.id)}
                  aria-label="Delete"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6">
                <div className="font-semibold text-gray-900">{d.name}</div>
                <div className="mt-2 text-sm text-gray-500 leading-relaxed">{d.description}</div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            <div className="px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="text-gray-500">Authorities</div>
                  <div className="mt-1 font-semibold text-gray-900">{d.authorities}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500">Active Issues</div>
                  <div className="mt-1 font-semibold text-gray-900">{d.activeIssues}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreateOpen(false)} aria-hidden="true" />

          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">Create Department</div>
                  <div className="text-sm text-gray-500">Add a new authority department</div>
                </div>

                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="w-9 h-9 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Department Name</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                    placeholder="e.g. Public Works"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                    placeholder="What does this department do?"
                    rows={3}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="h-10 px-4 rounded-md border border-gray-200 bg-white hover:bg-gray-50 font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createDepartment}
                    className="h-10 px-4 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                    disabled={!newName.trim()}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="h-10" />
    </div>
  );
}
