import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Percent,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

const EligibilityInfoSection = () => {
  const criteria = [
    {
      title: 'Monthly & Annual Income',
      desc: 'Demonstrates baseline repayment capacity. Regular salaried or business cashflows improve credit limits.',
      ideal: '₹25,000+ per month'
    },
    {
      title: 'CIBIL / Credit Score',
      desc: 'Reflects historical repayment discipline, credit utilization ratio, and past credit history.',
      ideal: 'Score of 700 to 900'
    },
    {
      title: 'Debt-to-Income (DTI) Ratio',
      desc: 'The proportion of your monthly income committed to servicing existing debts or EMIs.',
      ideal: 'Less than 50% DTI'
    },
    {
      title: 'Employment & Stability',
      desc: 'Company reputation, job tenure, and sector stability are considered for risk classification.',
      ideal: '6+ months employment'
    }
  ];

  const outcomes = [
    {
      category: 'ELIGIBLE',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Strong credit score (>700), low DTI (<40%), and stable income qualify for full requested amount and standard risk-adjusted interest rates.'
    },
    {
      category: 'PARTIALLY ELIGIBLE',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Moderate credit profile (650-700) or higher DTI (40-50%). A reduced loan amount or adjusted tenure is offered to keep monthly EMIs safe.'
    },
    {
      category: 'NOT ELIGIBLE',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      desc: 'Low credit score (<650) or high debt burden (>50% DTI). Applicants can improve debt ratio and re-evaluate eligibility.'
    }
  ];

  return (
    <section id="eligibility-info" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Underwriting Criteria
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          How EZFINANZ Evaluates Loan Eligibility
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Our intelligent algorithm evaluates key financial metrics to determine customized credit limits and risk-adjusted pricing.
        </p>
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {criteria.map((c, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Factor #{idx + 1}
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                {c.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {c.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-400 block">Benchmark:</span>
              <span className="font-bold text-slate-700">{c.ideal}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Outcome Tiers Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          Understanding Assessment Outcomes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outcomes.map((o, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2"
            >
              <span
                className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${o.badge}`}
              >
                {o.category}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {o.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EligibilityInfoSection;
