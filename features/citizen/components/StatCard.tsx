import React from "react";

type Props = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  tone?: "blue" | "emerald" | "amber" | "violet";
  trend?: React.ReactNode;
};

const toneMap: Record<NonNullable<Props["tone"]>, string> = {
  blue: "from-blue-50 to-indigo-50 text-blue-700 border-blue-100",
  emerald: "from-emerald-50 to-teal-50 text-emerald-700 border-emerald-100",
  amber: "from-amber-50 to-orange-50 text-amber-700 border-amber-100",
  violet: "from-violet-50 to-fuchsia-50 text-violet-700 border-violet-100",
};

export default function StatCard({ title, value, subtitle, icon, tone = "blue", trend }: Props) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-2 text-3xl font-semibold leading-none text-gray-900">{value}</div>
        </div>
        <div
          className={`h-11 w-11 rounded-xl border bg-linear-to-br ${toneMap[tone]} flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          {subtitle ? <div className="text-sm text-gray-600">{subtitle}</div> : <div />}
          {trend ? (
            <div className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 transition-colors group-hover:bg-gray-100">
              {trend}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
