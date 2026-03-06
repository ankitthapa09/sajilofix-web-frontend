"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import { handleLogout } from "@/lib/actions/auth-action";

const nav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, badge: "Preview" },
  { name: "User Management", href: "/admin/user-management", icon: Users },
  { name: "Issue Management", href: "/admin/issue-management", icon: FolderKanban },
  { name: "Departments", href: "/admin/departments", icon: BarChart3 },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Announcements", href: "/admin/announcements", icon: Bell },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Activity Logs", href: "/admin/activity-logs", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "/";
  const [hash, setHash] = React.useState<string>("");

  React.useEffect(() => {
    const read = () => setHash(window.location.hash || "");

    read();
    window.addEventListener("hashchange", read);
    window.addEventListener("popstate", read);
    return () => {
      window.removeEventListener("hashchange", read);
      window.removeEventListener("popstate", read);
    };
  }, []);

  const handleNavClick = (href: string) => {
    if (onNavigate) onNavigate();
    const nextHash = href.includes("#") ? `#${href.split("#")[1]}` : "";
    setHash(nextHash);
  };

  const confirmLogout: React.FormEventHandler<HTMLFormElement> = (event) => {
    if (window.confirm("Are you sure you want to log out?")) return;
    event.preventDefault();
  };

  const asideClassName =
    variant === "desktop"
      ? "w-64 h-[100dvh] sticky top-0 flex flex-col border-r border-white/5"
      : "w-full h-[100dvh] flex flex-col border-r border-white/5";

  return (
    <aside
      className={asideClassName}
      style={{
        background:
          "linear-gradient(120deg, #040B24 20%, #0E1B4D 50%, #4B3BFF 150%, #1A2D8A 0%, #040B24 0%)",
         //"linear-gradient(to right, #041027, #3533cd, #041027)",
      }}
    >
      <div className="px-4 pt-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            
            <img
              src="/sajilofix_logo_light.png"
              alt="logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-white text-2xl font-poppins">Sajilo Fix</div>
            <div className="text-xs text-white/80">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="space-y-1 flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const baseHref = item.href.split("#")[0];
          const isDashboardRoute = pathname === "/admin";
          const itemHash = item.href.includes("#") ? `#${item.href.split("#")[1]}` : "";

          const isActive =
            baseHref === "/admin"
              ? isDashboardRoute && (itemHash ? hash === itemHash : hash === "")
              : pathname === baseHref || pathname.startsWith(baseHref + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 " +
                (isActive
                  ? "bg-[#4F46E5] text-white shadow-[0_10px_30px_-14px_rgba(79,70,229,0.85)]"
                  : "text-white/70 hover:text-white hover:bg-white/5")
              }
            >
              <span
                className={
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 " +
                  (isActive
                    ? "bg-white/15"
                    : "bg-white/5 border border-white/10 group-hover:bg-white/10")
                }
              >
                <Icon
                  className={
                    "w-5 h-5 transition-colors duration-200 " +
                    (isActive ? "text-white" : "text-white/60 group-hover:text-white")
                  }
                />
              </span>
              <span className="text-sm font-medium">{item.name}</span>

              {item.badge ? (
                <span
                  className={
                    "ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold border " +
                    (isActive
                      ? "bg-white/15 text-white border-white/20"
                      : "bg-white/5 text-white/80 border-white/15")
                  }
                >
                  {item.badge}
                </span>
              ) : null}

              <span
                className={
                  "ml-auto text-sm transition-all duration-200 " +
                  (isActive ? "opacity-90" : "opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5")
                }
              >
                ›
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-6 shrink-0">
        <form action={handleLogout} onSubmit={confirmLogout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-white/80 hover:text-white hover:bg-white/10"
          >
            <span className="w-10 h-10 rounded-lg bg-red-500 border border-white/20 flex items-center justify-center text-sm">⎋</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
