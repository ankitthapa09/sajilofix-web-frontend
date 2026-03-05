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
  blue: "from-blue-50 to-indigo-50 text-blue-700",
  emerald: "from-emerald-50 to-teal-50 text-emerald-700",
  amber: "from-amber-50 to-orange-50 text-amber-700",
  violet: "from-violet-50 to-fuchsia-50 text-violet-700",
};

export default function StatCard({ title, value, subtitle, icon, tone = "blue", trend }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="mt-2 text-3xl font-semibold leading-none text-gray-900">{value}</div>
        </div>
        <div
          className={`h-11 w-11 rounded-xl bg-linear-to-br ${toneMap[tone]} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          {subtitle ? <div className="text-sm text-gray-600">{subtitle}</div> : <div />}
          {trend ? (
            <div className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
              {trend}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
