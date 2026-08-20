import React from 'react';
import {
  Building2,
  Target,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

const AboutCompanySection = () => {
  return (
    <section id="about-ezfinanz" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
          <Building2 className="w-3.5 h-3.5" />
          About Our Platform
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          About EZFINANZ
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          A modern digital personal-loan platform built for transparency, speed, and trusted borrowing.
        </p>
      </div>

      {/* Main Mission & Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mission Statement Card (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold border border-white/20">
            <Target className="w-3.5 h-3.5 text-blue-300" /> Our Mission
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
            Simplifying personal finance through transparent, customer-first digital technology.
          </h3>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            EZFINANZ is an innovative digital lending interface developed to eliminate cumbersome paperwork, hidden fees, and ambiguous terms. We provide everyday borrowers with accessible financial tools, instant eligibility assessments, and transparent loan terms.
          </p>
        </div>

        {/* Core Pillars (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> Platform Pillars
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block">Fast & Frictionless</strong>
                <span className="text-slate-500">
                  Instant eligibility feedback with zero complex paperwork.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block">Total Transparency</strong>
                <span className="text-slate-500">
                  Clear Key Fact Statements (KFS) with disclosed fees and EMIs.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block">Bank-Grade Privacy</strong>
                <span className="text-slate-500">
                  Secure encryption for sensitive identity and banking data.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCompanySection;
