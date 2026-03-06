"use client";

import React from "react";
import { X } from "lucide-react";

import CitizenSidebar from "@/features/citizen/components/CitizenSidebar";
import CitizenTopbar from "@/features/citizen/components/CitizenTopbar";
import { usersGetMe } from "@/lib/api/users";

type Props = {
  user: {
    fullName?: string;
    email?: string;
    profilePhoto?: string;
    status?: string;
  };
  children: React.ReactNode;
};

export default function CitizenShell({ user, children }: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [liveStatus, setLiveStatus] = React.useState<string | undefined>(user.status);

  React.useEffect(() => {
    let isMounted = true;

    usersGetMe()
      .then((resp) => {
        if (!isMounted) return;
        const status = resp.user?.status;
        setLiveStatus(typeof status === "string" ? status : undefined);
      })
      .catch(() => {
        if (!isMounted) return;
        setLiveStatus(user.status);
      });

    return () => {
      isMounted = false;
    };
  }, [user.status]);

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
          <CitizenSidebar userStatus={liveStatus} />
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
              <CitizenSidebar userStatus={liveStatus} variant="mobile" onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="flex-1 min-w-0">
          <CitizenTopbar user={user} onMenuClick={() => setMobileOpen(true)} />

          <div className="px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
