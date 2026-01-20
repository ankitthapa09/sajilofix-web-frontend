import React from "react";

const sample = [
  { id: 1, title: "Report RPT-001 marked as Resolved", time: "2 hours ago" },
  { id: 2, title: "New comment on RPT-002", time: "5 hours ago" },
  { id: 3, title: "Your report gained 10 upvotes", time: "1 day ago" },
  { id: 4, title: "Report RPT-002 moved to In Progress", time: "2 days ago" },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-semibold mb-3">Recent Activity</h3>
      <ul className="space-y-3">
        {sample.map((s) => (
          <li key={s.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">✓</div>
            <div>
              <div className="text-sm text-gray-800">{s.title}</div>
              <div className="text-xs text-gray-400">{s.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
