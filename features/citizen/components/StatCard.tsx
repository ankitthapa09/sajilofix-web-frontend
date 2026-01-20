import React from "react";

type Props = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: string;
};

export default function StatCard({ title, value, subtitle, icon, accent }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-gray-800">{value}</div>
          <div className="text-sm text-gray-500 mt-1">{title}</div>
        </div>
        <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-blue-600">{icon}</div>
      </div>
      {subtitle && <div className="text-sm text-blue-600 mt-3">{subtitle}</div>}
    </div>
  );
}
