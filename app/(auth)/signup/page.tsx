import SignupForm from "../_components/signup_form";
import Image from "next/image";
import signup from "../../../public/signupbg.png"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center bg-white py-12">
        <SignupForm />
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2C27AE] via-[#5B8FB9] to-[#27AE60] relative overflow-hidden">
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Character illustration placeholder */}
            <div className="absolute top-10 opacity-20 animate-float">
              <Image src={signup} alt="Signup Background" className="w-130 h-190  backdrop-blur-sm" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Be Part of the Solution
            </h1>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Every voice matters. Join our growing community of engaged citizens and dedicated authorities making Nepal better.
            </p>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Active Issues */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">2,847</div>
                <div className="text-white/80 text-sm">Active Issues</div>
              </div>

              {/* Resolved */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">1,923</div>
                <div className="text-white/80 text-sm">Resolved</div>
              </div>

              {/* Citizens */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">5,432</div>
                <div className="text-white/80 text-sm">Citizens</div>
              </div>

              {/* Authorities */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">127</div>
                <div className="text-white/80 text-sm">Authorities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}