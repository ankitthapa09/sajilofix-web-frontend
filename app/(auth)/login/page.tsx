import LoginForm from "../_components/login_form";
import Image from "next/image";
import loginbg from "../../../public/loginbg.png";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <LoginForm />
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-[#2C27AE] via-[#5B8FB9] to-[#27AE60] relative overflow-hidden">
        {/* Background Illustration - Character */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* illustration  */}
            <div className="absolute top-10 opacity-20 animate-float">
              <Image src={loginbg} alt="Login Background" className="w-130 h-190  backdrop-blur-sm" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Transforming Communities Together
            </h1>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Join thousands of citizens and authorities working together to create better, more responsive communities across Nepal.
            </p>

            {/* Features */}
            <div className="space-y-6">
              {/* Real-time Tracking */}
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Real-time Tracking</h3>
                  <p className="text-white/80 text-sm">
                    Monitor every stage of your report from submission to resolution
                  </p>
                </div>
              </div>

              {/* Instant Updates */}
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Instant Updates</h3>
                  <p className="text-white/80 text-sm">
                    Get notified about important changes to your reported issues
                  </p>
                </div>
              </div>

              {/* Secure & Private */}
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
                  <h3 className="text-lg font-semibold mb-1">Secure & Private</h3>
                  <p className="text-white/80 text-sm">
                    Your data is protected with enterprise-grade security
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