"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  MessageSquare,
  ChevronRight
} from "lucide-react";
import logo from "../../public/logo.png";

const LandingPage = () => {
  return (
    <main className="w-full bg-white text-slate-900 selection:bg-blue-100">
      {/* Navbar - Sticky & Blurred */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image src={logo} alt="Sajilo Fix" className="h-12 w-auto object-contain" />
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="#stats" className="hover:text-blue-600 transition-colors">Impact</Link>
            <Link href="/explore" className="hover:text-blue-600 transition-colors">Explore Issues</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Gradient & Mesh */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_farthest-side,rgba(53,51,205,0.08),transparent)] blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            Live in Kathmandu & Pokhara
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Report. Resolve. <span className="text-blue-600">Revive.</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Empowering citizens to fix urban challenges. Report issues in seconds, 
            track resolutions, and build a better Nepal together.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all group">
              Report an Issue
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all">
              View Map
            </button>
          </div>
        </div>
      </section>

      {/* Modern Stats Section */}
      <section id="stats" className="py-20 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Issues Fixed", val: "1.9k+", icon: CheckCircle2, color: "text-emerald-600" },
              { label: "Active Citizens", val: "5.4k+", icon: Users, color: "text-blue-600" },
              { label: "Response Time", val: "24hrs", icon: BarChart3, color: "text-purple-600" },
              { label: "Cities", val: "12", icon: MapPin, color: "text-orange-600" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`p-3 rounded-2xl bg-white shadow-sm mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-slate-900">{stat.val}</span>
                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento-Style How It Works */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Making change is simple</h2>
          <p className="text-slate-500 mt-2">A streamlined process for citizens and authorities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="group p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <span className="text-xl font-bold">01</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Snap & Submit</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Take a photo of the pothole, broken streetlight, or waste. Our AI tags the location automatically.
              </p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/40 transition-all"></div>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200">
            <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <span className="text-xl font-bold">02</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Direct Routing</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Reports are instantly routed to the specific municipal ward or utility department responsible.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white hover:border-blue-200 transition-colors">
            <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <span className="text-xl font-bold text-slate-900">03</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Track Progress</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Receive notifications as the status changes from "Reported" to "In-Progress" to "Resolved".
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 mb-24">
        <div className="max-w-7xl mx-auto rounded-[2rem] bg-gradient-to-r from-blue-700 to-indigo-800 p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to fix your neighborhood?</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Join 5,000+ citizens who are already making a difference. Download our mobile app for the best experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                Register as Citizen
              </button>
              <button className="bg-blue-500/30 backdrop-blur-md border border-white/20 px-8 py-3 rounded-xl font-bold hover:bg-blue-500/50 transition-colors">
                Authority Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal & Modern */}
      <footer className="border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image src={logo} alt="Sajilo Fix" className="h-8 w-auto grayscale opacity-70" />
              <span className="text-sm font-semibold text-slate-400 tracking-tight">SAJILO FIX</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500 font-medium">
              <Link href="#" className="hover:text-blue-600">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-600">Terms</Link>
              <Link href="#" className="hover:text-blue-600">Contact</Link>
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Sajilo Fix. Made for Nepal.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;