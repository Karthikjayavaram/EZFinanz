import React from 'react';
import {
  UserPlus,
  MailCheck,
  ShieldCheck,
  Calculator,
  Sliders,
  Building2,
  FileCheck,
  Camera,
  Search,
  CheckCircle2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const HowItWorksSection = ({ onStartClick }) => {
  const steps = [
    {
      num: '01',
      title: 'Create Account',
      desc: 'Sign up in under 60 seconds with your email and basic details.',
      icon: <UserPlus className="w-5 h-5 text-blue-600" />
    },
    {
      num: '02',
      title: 'Verify OTP',
      desc: 'Verify your email & phone number with secure 6-digit OTPs.',
      icon: <MailCheck className="w-5 h-5 text-blue-600" />
    },
    {
      num: '03',
      title: 'Digital KYC',
      desc: 'Enter verified identity details (PAN / Aadhaar) and upload proof.',
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />
    },
    {
      num: '04',
      title: 'Check Eligibility',
      desc: 'Instant financial assessment based on income, debt, and credit tier.',
      icon: <Calculator className="w-5 h-5 text-blue-600" />
    },
    {
      num: '05',
      title: 'Customize EMI',
      desc: 'Select preferred loan amount and repayment tenure with full KFS clarity.',
      icon: <Sliders className="w-5 h-5 text-blue-600" />
    },
    {
      num: '06',
      title: 'Link Bank',
      desc: 'Provide verified account details for direct funds transfer.',
      icon: <Building2 className="w-5 h-5 text-blue-600" />
    },
    {
      num: '07',
      title: 'Sign Declaration',
      desc: 'Review transparency terms, KFS disclosures, and consent digitally.',
      icon: <FileCheck className="w-5 h-5 text-blue-600" />
    },
    {
      num: '08',
      title: 'Live Selfie',
      desc: 'Submit a live photo verification using camera or image capture.',
      icon: <Camera className="w-5 h-5 text-blue-600" />
    },
    {
      num: '09',
      title: 'Admin Review',
      desc: 'Our credit underwriting team reviews your documents & photo.',
      icon: <Search className="w-5 h-5 text-blue-600" />
    },
    {
      num: '10',
      title: 'Sanction Approval',
      desc: 'Receive formal loan sanction with personalized credit terms.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    },
    {
      num: '11',
      title: 'Disbursement',
      desc: 'Funds are credited directly to your bank with transaction reference.',
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />
    }
  ];

  return (
    <section id="how-it-works" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Simple 11-Step Process
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            How EZFINANZ Works
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            A seamless, 100% paperless digital lending journey from initial registration to loan disbursement.
          </p>
        </div>

        <button
          onClick={onStartClick}
          className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          Start Application <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Process Steps Timeline - Responsive Grid / Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3 relative group ${
              idx === steps.length - 1 ? 'sm:col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-1 bg-gradient-to-br from-indigo-50/50 to-white' : ''
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {step.num}
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">
                {step.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
