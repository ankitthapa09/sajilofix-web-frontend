import ForgotPasswordForm from "../_components/forgot_password_form";
import Image from "next/image";
import loginbg from "../../../public/loginbg.png";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center bg-white">
        <ForgotPasswordForm />
      </div>

      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#1F9D55] via-[#2BB673] to-[#49C28C] relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={loginbg}
            alt="Recovery Background"
            fill
            sizes="100vw"
            className="object-cover opacity-15"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold mb-4 leading-tight">Secure Account Recovery</h1>
            <p className="text-lg text-white/90 mb-10 leading-relaxed">
              Your account security is our priority. We will help you regain access quickly and safely.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="shrink-0 w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Quick Recovery</h3>
                  <p className="text-white/80 text-sm">Receive your reset link instantly via email.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="shrink-0 w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Secure Process</h3>
                  <p className="text-white/80 text-sm">Protected with industry-standard encryption.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="shrink-0 w-10 h-10 bg-white/25 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">24/7 Support</h3>
                  <p className="text-white/80 text-sm">Our team is here to help whenever you need.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
