import React from 'react';
import {
  Smartphone,
  PieChart,
  ShieldCheck,
  Lock,
  BarChart3,
  Eye,
  FileLock2,
  Zap,
  Sparkles
} from 'lucide-react';

const WhyChooseUsSection = () => {
  const highlights = [
    {
      title: '100% Digital Experience',
      desc: 'Complete paperless application from the comfort of your home or mobile device without physical branch visits.',
      icon: <Smartphone className="w-5 h-5 text-blue-600" />
    },
    {
      title: 'Zero Hidden Charges',
      desc: 'Transparent pricing with complete disclosure of interest rate, processing fee (2%), GST (18%), and net payout.',
      icon: <PieChart className="w-5 h-5 text-emerald-600" />
    },
    {
      title: 'Instant Identity & KYC',
      desc: 'Quick online identity evaluation with government ID verification and secure document upload.',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />
    },
    {
      title: 'Multi-Factor OTP Security',
      desc: 'Dedicated email and mobile OTP validation ensuring only authorized account holders access credit services.',
      icon: <Lock className="w-5 h-5 text-amber-600" />
    },
    {
      title: 'Credit-Based Assessment',
      desc: 'Intelligent underwriting considering your monthly income, CIBIL score, and debt-to-income (DTI) ratio.',
      icon: <BarChart3 className="w-5 h-5 text-purple-600" />
    },
    {
      title: 'Real-Time Stage Tracking',
      desc: 'Track every phase of your application live with clear stage indicators and status milestones.',
      icon: <Eye className="w-5 h-5 text-cyan-600" />
    },
    {
      title: 'Bank-Grade Data Privacy',
      desc: 'Masked ID and account numbers with encrypted cloud storage to protect your personal and financial details.',
      icon: <FileLock2 className="w-5 h-5 text-rose-600" />
    },
    {
      title: 'Simulated Fast Disbursement',
      desc: 'Instant post-approval simulated disbursement generating official reference identifiers for demonstration.',
      icon: <Zap className="w-5 h-5 text-blue-600" />
    }
  ];

  return (
    <section id="why-choose-us" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Fintech Advantages
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Why Choose EZFINANZ?
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Built from the ground up for transparency, security, and simplicity in digital personal lending.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((h, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              {h.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {h.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {h.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
