"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import CitizenSidebar from "@/features/citizen/components/CitizenSidebar";
import NotificationBell from "@/features/shared/notifications/NotificationBell";

type Props = {
  children: React.ReactNode;
};

export default function CitizenShell({ children }: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname() || "/citizen";

  const headerConfig = React.useMemo(() => {
    if (pathname.startsWith("/citizen/report-new-issue")) {
      return {
        title: "Report New Issue",
        subtitle: "Help us identify and resolve community issues.",
        showCta: false,
      };
    }

    if (pathname.startsWith("/citizen/reports")) {
      return {
        title: "My Reports",
        subtitle: "Track the status of your reported issues.",
        showCta: true,
      };
    }

    if (pathname.startsWith("/citizen/map")) {
      return {
        title: "Explore Map",
        subtitle: "Explore your reports geographically and track progress.",
        showCta: true,
      };
    }

    return {
      title: "Dashboard Overview",
      subtitle: "Welcome back! Here is whats happening with your reports.",
      showCta: true,
    };
  }, [pathname]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-gray-50">
      <div className="flex min-h-dvh">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <CitizenSidebar />
        </div>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/40"
            />

            <div className="absolute inset-y-0 left-0 w-74 max-w-[85vw] bg-white shadow-2xl">
              <div className="absolute right-3 top-3 z-10">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CitizenSidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="flex-1 min-w-0">
          <header className="px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden w-10 h-10 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </button>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain" />
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-semibold truncate">{headerConfig.title}</h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{headerConfig.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <NotificationBell
                  buttonClassName="bg-white border border-gray-200 px-3 py-2 rounded-md relative transition-all hover:-translate-y-px hover:shadow-sm"
                  panelClassName="absolute right-0 z-40 mt-2 w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white shadow-lg"
                />
                {headerConfig.showCta ? (
                  <Link
                    href="/citizen/report-new-issue/category"
                    className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto text-center"
                  >
                    Report New Issue
                  </Link>
                ) : null}
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
