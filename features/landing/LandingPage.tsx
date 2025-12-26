"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Zap,
    Map,
    Globe,
    ShieldCheck,
    BarChart3,
    ChevronRight,
    Twitter,
    Instagram,
    Facebook
} from "lucide-react";
import logo from "../../public/logo.png";

const LandingPage = () => {
    return (
        <main className="relative w-full min-h-screen bg-[#F0F4FF] overflow-x-hidden font-sans text-slate-900">

            {/* --- BACKGROUND BLOBS (Hero) --- */}
            <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-cyan-200/30 rounded-full blur-[100px]" />
            </div>

            {/* --- NAVBAR (Floating Glass) --- */}
            <div className="relative z-50 pt-6 px-4">
                {/* <nav className="max-w-6xl mx-auto bg-gradient-to-r from-blue-900/10 via-blue-600/15 to-indigo-900/20 backdrop-blur-2xl border border-white/30 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"> */}
                {/* <nav className="max-w-6xl mx-auto bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-indigo-600/10 backdrop-blur-3xl border border-blue-200/20 rounded-full px-6 py-3 flex items-center justify-between shadow-sm"> */}
                <nav className="max-w-9xl h-27 mx-auto bg-gradient-to-b from-blue-50/40 to-white/10 backdrop-blur-md border-t border-l border-white/60 border-b border-r border-white/20 rounded-full px-6 py-3 flex items-center justify-between shadow-xl shadow-blue-900/5">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="mb-2">
                            <Image
                                src={logo}
                                alt="Sajilo Fix"
                                width={100}
                                height={60}
                                className="object-contain"
                            />
                        </div>
                    </Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <Link href="#" className="hover:text-blue-600 transition-colors">How it Works</Link>
                        <Link href="#" className="hover:text-blue-600 transition-colors">Impact</Link>
                        <Link href="#" className="hover:text-blue-600 transition-colors">Live Map</Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600">
                            Explore Issues
                        </Link>
                        <Link href="/signup">
                            <button className="bg-blue-900 text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                Sign In
                            </button>
                        </Link>
                    </div>
                </nav>
            </div>

            {/* --- HERO SECTION --- */}
            <section className="relative z-10 pt-16 pb-32 px-6">
                {/* text center ma rakhna ko lagi */}
                <div className="max-w-6xl mx-auto text-center flex flex-col items-center">

                    {/* Location Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white px-4 py-1.5 rounded-full shadow-sm mb-8 animate-fade-in-up">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">Empowering Citizens to Build Better Cities</span>
                    </div>

                    {/* Main Headline - Centered & One Line */}
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#041027] via-[#3533cd] to-[#041027]">Report. Resolve.Revive.</span>
                    </h1>

                    <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Making change is simple. Join thousands of citizens reporting issues and tracking resolutions in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
                        <button className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            <Zap size={18} fill="currentColor" />
                            Start Reporting
                        </button>
                        <button className="bg-white/80 border border-white text-slate-700 px-8 py-3.5 rounded-full font-bold hover:bg-white transition-all shadow-sm">
                            View Map
                        </button>
                    </div>

                </div>
            </section>

            {/* --- CARDS SECTION (Overlapping) --- */}
            <section className="relative z-20 px-6 -mt-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">

                        {/* Card 01: Dark */}
                        <div className="flex-1 bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/20 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
                            {/* Subtle grid pattern bg */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                            <div className="relative z-10">
                                <span className="text-4xl font-bold opacity-30 block mb-6">01</span>
                                <div className="mb-6 bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                    <Globe size={28} className="text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Snap & Submit</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Take a photo of the issue. Our AI automatically tags the location and category.
                                </p>
                            </div>
                        </div>

                        {/* Card 02: Blue */}
                        <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-500/30 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-10 -translate-y-10"></div>

                            <div className="relative z-10">
                                <span className="text-4xl font-bold opacity-30 block mb-6">02</span>
                                <div className="mb-6 bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                    <ShieldCheck size={28} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Direct Routing</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Reports are instantly verified and routed to the correct local authority.
                                </p>
                            </div>
                        </div>

                        {/* Card 03: White */}
                        <div className="flex-1 bg-white rounded-4xl p-8 text-slate-900 shadow-xl border border-slate-100 hover:border-blue-200 hover:-translate-y-2 transition-all duration-300">
                            <span className="text-4xl font-bold text-slate-200 block mb-6">03</span>
                            <div className="mb-6 bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center">
                                <BarChart3 size={28} className="text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Track Progress</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Get real-time notifications on your phone as the issue gets resolved.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- BLUE WAVE CTA SECTION --- */}
            <section className="relative z-10 mt-27">
                {/* The Blue Background Block */}
                {/* <div className="bg-gradient-to-b from-blue-600 to-[#1e3a8a] pb-32 pt-32 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(37,99,235,0.25)]"> */}
                <div className="bg-gradient-to-t from-blue-500/40 to-white/20 backdrop-blur-md border-t border-l border-gradient-to-r from-[#041027] to-[#3533cd] border-b border-r border-blue-800/40 rounded-t-[3rem] px-6 py-3 flex items-center justify-between shadow-xl shadow-blue-900/5">
                    <div className="max-w-4xl mx-auto text-center px-9">

                        <h2 className="text-3xl md:text-5xl font-bold text-blue-800/90 mb-4 py-12">
                            Ready to fix your neighborhood?
                        </h2>
                        <p className="text-blue-100 mb-12 text-lg">
                            Join the community to report issues and track progress instantly.
                        </p>

                        {/* Floating Stats Box */}
                        <div className="bg-white rounded-4xl p-8 shadow-2xl mx-auto max-w-5xl transform hover:scale-[1.04] transition-transform duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-400">
                                <div className="pt-4 md:pt-0">
                                    <div className="text-4xl font-extrabold text-slate-900 mb-1">2.8k</div>
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Reports Filed</div>
                                </div>
                                <div className="pt-4 md:pt-0">
                                    <div className="text-4xl font-extrabold text-slate-900 mb-1">1.9k</div>
                                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Successful Fixes</div>
                                </div>
                                <div className="pt-4 md:pt-0">
                                    <div className="text-4xl font-extrabold text-slate-900 mb-1">12</div>
                                    <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">Cities Covered</div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Buttons */}
                        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 mb-12">
                            <button className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-colors">
                                Register as Citizen
                            </button>
                            <button className="bg-blue-800/50 border border-blue-400/30 text-white px-8 py-3.5 rounded-xl font-bold backdrop-blur-sm hover:bg-blue-800 transition-colors">
                                Authority Login
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-[#041027] text-white py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-18">

                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-white font-bold">
                            {/* <Zap size={18} fill="currentColor" /> */}
                            <Image
                                src={logo}
                                alt="Sajilo Fix"
                                className="object-contain w-10 h-10"
                            />
                        </div>
                        <span className="font-bold text-lg text-slate-100">SAJILO FIX</span>
                    </div>

                    <div className="flex gap-6">
                        <a href="#" className="hover:text-blue-500 transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="hover:text-blue-500 transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="hover:text-blue-500 transition-colors"><Facebook size={20} /></a>
                    </div>

                    <div className="text-sm font-medium">
                        Made for Nepal <span className="text-red-500">🇳🇵</span>
                    </div>
                </div>
            </footer>

        </main>
    );
};

export default LandingPage;