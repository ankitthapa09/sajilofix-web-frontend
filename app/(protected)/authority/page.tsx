import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const stats = [
  {
    label: "Active Issues",
    value: "6",
    note: "+12% this week",
    icon: FileText,
    tone: "text-blue-600 bg-blue-50",
  },
  {
    label: "Pending Review",
    value: "3",
    note: "Requires action",
    icon: Clock3,
    tone: "text-orange-600 bg-orange-50",
  },
  {
    label: "Response Rate",
    value: "98%",
    note: "Within 24 hours",
    icon: ShieldCheck,
    tone: "text-indigo-600 bg-indigo-50",
  },
  {
    label: "Satisfaction Rate",
    value: "94%",
    note: "+2% this month",
    icon: CheckCircle2,
    tone: "text-emerald-600 bg-emerald-50",
  },
];

const categoryDistribution = [
  { label: "Roads & Potholes", value: 33, tone: "bg-blue-500" },
  { label: "Waste Management", value: 21, tone: "bg-emerald-500" },
  { label: "Water Supply", value: 17, tone: "bg-cyan-500" },
  { label: "Street Lights", value: 17, tone: "bg-amber-500" },
  { label: "Public Infrastructure", value: 12, tone: "bg-purple-500" },
];

const recentActivities = [
  {
    title: "New urgent report submitted",
    detail: "Garbage Pile Near School - RPT-003",
    time: "15 min ago",
    tone: "bg-rose-50 text-rose-600",
    icon: AlertTriangle,
  },
  {
    title: "Issue marked as resolved",
    detail: "RPT-001 has been successfully closed",
    time: "2 hours ago",
    tone: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },
  {
    title: "New issue assigned to you",
    detail: "Water Leakage - RPT-004",
    time: "5 hours ago",
    tone: "bg-blue-50 text-blue-600",
    icon: FileText,
  },
  {
    title: "New citizen response",
    detail: "Citizen added update on RPT-002",
    time: "1 day ago",
    tone: "bg-purple-50 text-purple-600",
    icon: BarChart3,
  },
];

const recentIssues = [
  {
    id: "RPT-003",
    title: "Garbage Pile Near School",
    location: "Patan, Ward 5",
    time: "6 days open",
    priority: "Urgent",
    status: "Pending",
  },
  {
    id: "RPT-002",
    title: "Pothole on Ring Road",
    location: "Kalanki",
    time: "3 days open",
    priority: "High",
    status: "In Progress",
  },
];

function badgeClass(value: string) {
  if (value === "Urgent") return "bg-rose-100 text-rose-700";
  if (value === "High") return "bg-orange-100 text-orange-700";
  if (value === "Pending") return "bg-gray-100 text-gray-700";
  if (value === "In Progress") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-700";
}

export default function AuthorityDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={"flex h-10 w-10 items-center justify-center rounded-xl " + stat.tone}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300" />
              </div>
              <div className="mt-4 text-2xl font-semibold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="mt-2 text-xs text-emerald-600">{stat.note}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm font-semibold text-rose-700">
            <AlertTriangle className="h-4 w-4" />
            1 Urgent Issue Requiring Immediate Attention
          </div>
          <button className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">
            Review Now
          </button>
        </div>
        <div className="mt-3 rounded-xl border border-rose-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">RPT-003</span>
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Urgent</span>
            <div className="text-sm font-semibold text-gray-900">Garbage Pile Near School</div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <div className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Patan, Ward 5</div>
            <div>6 days open</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-700">Performance Metrics</div>
            <span className="text-xs text-gray-400">Last 30 days</span>
          </div>
          <div className="grid gap-4 px-5 py-4 md:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="text-xs text-blue-600">Avg Resolution Time</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">3.8 days</div>
              <div className="text-xs text-emerald-600">12% faster</div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="text-xs text-emerald-600">Resolution Rate</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">0%</div>
              <div className="text-xs text-gray-400">1 resolved</div>
            </div>
            <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4">
              <div className="text-xs text-purple-600">Citizen Engagement</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">134</div>
              <div className="text-xs text-gray-400">Total upvotes</div>
            </div>
          </div>
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="text-xs font-semibold text-gray-500">Category Distribution</div>
            <div className="mt-3 space-y-3">
              {categoryDistribution.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className={"h-2 rounded-full " + item.tone} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="text-sm font-semibold text-gray-700">Recent Activity</div>
          </div>
          <div className="px-5 py-4 space-y-4">
            {recentActivities.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3">
                  <div className={"h-9 w-9 rounded-lg flex items-center justify-center " + item.tone}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-800">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.detail}</div>
                    <div className="text-xs text-gray-400">{item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 px-5 py-3 text-right">
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              View All Activity <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-700">Recent Issues</div>
          <button className="text-xs font-semibold text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {recentIssues.map((issue) => (
            <div key={issue.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {issue.id}
                </span>
                <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + badgeClass(issue.priority)}>
                  {issue.priority}
                </span>
                <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + badgeClass(issue.status)}>
                  {issue.status}
                </span>
                <div className="text-sm font-semibold text-gray-900">{issue.title}</div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <div className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {issue.location}</div>
                <div>{issue.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
