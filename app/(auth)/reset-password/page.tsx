import ResetPasswordForm from "../_components/reset_password_form";
import Image from "next/image";
import loginbg from "../../../public/loginbg.png";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center bg-white">
        <ResetPasswordForm />
      </div>

      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#1F9D55] via-[#2BB673] to-[#49C28C] relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={loginbg}
            alt="Security Background"
            fill
            sizes="100vw"
            className="object-cover opacity-15"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold mb-4 leading-tight">Update Your Password</h1>
            <p className="text-lg text-white/90 mb-10 leading-relaxed">
              Set a strong new password to keep your account safe and secure.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="shrink-0 w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Strong Protection</h3>
                  <p className="text-white/80 text-sm">Use a unique password for better security.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="shrink-0 w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Private by Design</h3>
                  <p className="text-white/80 text-sm">We never store passwords in plain text.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="shrink-0 w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Instant Access</h3>
                  <p className="text-white/80 text-sm">Sign in immediately after updating your password.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
