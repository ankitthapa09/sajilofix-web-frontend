import Image from "next/image";

import LoginForm from "../../_components/login_form";
import loginbg from "../../../../public/loginbg.png";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8">
          <div className="flex items-center justify-end mb-4">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <Link
                href="/login"
                className="px-4 h-9 inline-flex items-center rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                User
              </Link>
              <span className="px-4 h-9 inline-flex items-center rounded-md text-sm font-semibold bg-gray-900 text-white">
                Admin
              </span>
            </div>
          </div>
          <LoginForm mode="admin" />
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#2C27AE] via-[#5B8FB9] to-[#27AE60] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute top-10 opacity-20 animate-float">
              <Image
                src={loginbg}
                alt="Login Background"
                className="w-130 h-190 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Admin Portal
            </h1>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Sign in with an admin email to manage users, roles, and system
              settings.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zM6 19c0-3.314 2.686-6 6-6s6 2.686 6 6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    User Management
                  </h3>
                  <p className="text-white/80 text-sm">
                    Create authority accounts and manage all users.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Role Based Access</h3>
                  <p className="text-white/80 text-sm">
                    Access is enforced by the email-based role rules.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Secure Session</h3>
                  <p className="text-white/80 text-sm">
                    Your session is stored securely via server actions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
