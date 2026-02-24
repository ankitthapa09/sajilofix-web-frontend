"use client";

import React, { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

type CategoryCard = {
  id: string;
  name: string;
  icon: string;
  issueCount: number;
  status: "active" | "inactive";
};

function statusPill(status: CategoryCard["status"]) {
  return status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700";
}

export default function AdminCategoriesPage() {
  const seed = useMemo<CategoryCard[]>(
    () => [
      { id: "c1", name: "Roads & Potholes", icon: "🛣️", issueCount: 45, status: "active" },
      { id: "c2", name: "Electricity", icon: "⚡️", issueCount: 18, status: "active" },
      { id: "c3", name: "Water Supply", icon: "💧", issueCount: 19, status: "active" },
      { id: "c4", name: "Waste Management", icon: "♻️", issueCount: 28, status: "active" },
      { id: "c5", name: "Street Lights", icon: "💡", issueCount: 32, status: "active" },
      { id: "c6", name: "Public Infrastructure", icon: "🏗️", issueCount: 12, status: "active" },
      { id: "c7", name: "Others", icon: "🧩", issueCount: 4, status: "active" },
    ],
    [],
  );

  const [categories, setCategories] = useState<CategoryCard[]>(seed);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🏷️");

  const removeCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    const ok = window.confirm(`Delete category ${cat?.name ?? ""}?`);
    if (!ok) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const createCategory = () => {
    const name = newName.trim();
    if (!name) return;

    setCategories((prev) => [
      {
        id: `c_${Date.now()}`,
        name,
        icon: (newIcon || "🏷️").trim(),
        issueCount: 0,
        status: "active",
      },
      ...prev,
    ]);

    setNewName("");
    setNewIcon("🏷️");
    setCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Category Management</h2>
          <p className="text-sm text-gray-500">Manage issue categories and classifications</p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-xl">
                  {c.icon}
                </div>

                <div>
                  <div className="font-semibold text-gray-900 leading-tight">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.issueCount} issues</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusPill(c.status)}`}>
                  {c.status}
                </span>

                <button
                  type="button"
                  onClick={() => removeCategory(c.id)}
                  aria-label="Delete"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                  <div className="font-semibold text-gray-900">Create Category</div>
                  <div className="text-sm text-gray-500">Add a new issue category</div>
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
                  <label className="text-sm font-medium text-gray-700">Category Name</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                    placeholder="e.g. Street Lighting"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Icon (emoji)</label>
                  <input
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200"
                    placeholder="e.g. 💡"
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
                    onClick={createCategory}
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
