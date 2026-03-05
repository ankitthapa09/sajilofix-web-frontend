import React from "react";
import { BellDot, CheckCircle2, Clock3 } from "lucide-react";

export type ActivityItem = {
  id: string;
  title: string;
  time: string;
  unread?: boolean;
};

type Props = {
  items: ActivityItem[];
  isLoading?: boolean;
};

export default function RecentActivity({ items, isLoading = false }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
        <span className="text-xs font-medium text-gray-500">Latest updates</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : items.length ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  item.unread ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {item.unread ? <BellDot className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-gray-800">{item.title}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  {item.time}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          No recent activity yet.
        </div>
      )}
    </div>
  );
}
