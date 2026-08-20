import React from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  TrendingUp
} from 'lucide-react';
import heroImg from '../../assets/hero-banner.jpg';

const FintechHeroSection = ({ userName, onApply, application, starting }) => {
  const isDisbursed = application?.status === 'DISBURSED';
  const isApproved = application?.status === 'APPROVED';

  return (
    <div className="relative w-full min-h-[620px] sm:min-h-[680px] lg:min-h-[740px] xl:min-h-[800px] flex items-start overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white shadow-2xl border-b border-slate-800/80">
      {/* Background glow effects spanning whole screen width */}
      <div className="absolute -top-40 right-1/4 w-[900px] h-[900px] bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-0 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 pt-5 sm:pt-7 lg:pt-8 xl:pt-9 pb-12 sm:pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Messaging & CTA (7 cols on lg, 8 cols on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-7">
            <div className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-white/10 backdrop-blur-md text-blue-300 text-xs sm:text-sm font-bold border border-white/15 shadow-inner">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Digital Personal Credit Platform</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.12]">
                Fast, Transparent &amp; <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
                  100% Digital Personal Loans
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl leading-relaxed">
                Welcome back, <span className="text-white font-bold">{userName || 'Customer'}</span>. Access tailored credit limits up to <span className="text-emerald-400 font-bold">₹10,00,000</span> with instant digital KYC, transparent terms, and direct bank disbursement.
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                onClick={onApply}
                disabled={starting}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-75 text-white font-bold text-sm sm:text-base px-9 py-4.5 rounded-xl flex items-center gap-2.5 shadow-xl shadow-blue-600/35 hover:shadow-blue-500/45 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {starting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    <span>Starting Application...</span>
                  </>
                ) : (
                  <>
                    {isDisbursed
                      ? 'View Active Loan Terms'
                      : isApproved
                      ? 'View Loan Sanction'
                      : application?.currentStage
                      ? 'Continue Application Step'
                      : 'Apply for Personal Loan'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <a
                href="#loan-options-section"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base px-8 py-4.5 rounded-xl border border-white/15 hover:border-white/30 backdrop-blur-md transition-all text-center"
              >
                Explore Loan Options
              </a>
            </div>
          </div>

          {/* Right Column: Visual 3D Graphic */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end mt-10 sm:mt-14 lg:mt-20 ">
            <div className="relative w-full max-w-lg lg:max-w-none group">
              {/* Glowing frame */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-65 transition duration-500" />
              
              <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-slate-950 shadow-2xl">
                <img
                  src={heroImg}
                  alt="EZFINANZ Digital Credit Platform"
                  className="w-full h-auto object-cover min-h-[360px] max-h-[440px] sm:max-h-[500px] lg:max-h-[560px] xl:max-h-[600px] w-full transform group-hover:scale-102 transition-transform duration-500"
                />

                {/* Floating Pill Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/15 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm sm:text-base">
                      ✓
                    </div>
                    <div>
                      <span className="font-bold text-white block text-xs sm:text-sm">Pre-Approved Limits</span>
                      <span className="text-[11px] sm:text-xs text-slate-400">Risk-adjusted pricing</span>
                    </div>
                  </div>
                  <span className="font-mono font-extrabold text-emerald-400 text-sm sm:text-base">
                    ₹10,00,000 Max
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FintechHeroSection;
