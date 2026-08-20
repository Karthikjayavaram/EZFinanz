import React, { useState, useMemo } from 'react';
import {
  Calculator,
  IndianRupee,
  Calendar,
  Percent,
  Info,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

const EmiCalculatorSection = ({ onApplyWithTerms }) => {
  const [loanAmount, setLoanAmount] = useState(300000);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [interestRate, setInterestRate] = useState(12.5);

  // Exact EMI & Fee Math
  const calculations = useMemo(() => {
    const P = Number(loanAmount);
    const n = Number(tenureMonths);
    const annualRate = Number(interestRate);
    const r = annualRate / 12 / 100;

    let emi = 0;
    if (r > 0) {
      emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    } else {
      emi = Math.round(P / n);
    }

    const totalRepayment = emi * n;
    const totalInterest = Math.max(0, totalRepayment - P);

    // Standard Fees
    const processingFee = Math.round(P * 0.02); // 2%
    const gst = Math.round(processingFee * 0.18); // 18% GST
    const totalCharges = processingFee + gst;
    const netDisbursement = Math.max(0, P - totalCharges);

    return {
      emi,
      totalInterest,
      totalRepayment,
      processingFee,
      gst,
      totalCharges,
      netDisbursement
    };
  }, [loanAmount, tenureMonths, interestRate]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <section id="emi-calculator" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
          <Calculator className="w-3.5 h-3.5" />
          Interactive Planning Tool
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Understand Your EMI & Repayment
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Use our interactive calculator to estimate monthly installments and view full fee transparency before applying.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sliders Control Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-base">Customize Loan Parameters</h3>

          {/* 1. Loan Amount Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-600" /> Loan Amount
              </label>
              <span className="font-black text-slate-900 text-base font-mono">
                {formatCurrency(loanAmount)}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>₹10,000</span>
              <span>₹5,00,000</span>
              <span>₹10,00,000</span>
            </div>
          </div>

          {/* 2. Tenure Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Repayment Tenure
              </label>
              <span className="font-black text-slate-900 text-base font-mono">
                {tenureMonths} Months ({Math.floor(tenureMonths / 12)}Y {tenureMonths % 12}M)
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={60}
              step={1}
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>3 Mos</span>
              <span>24 Mos</span>
              <span>60 Mos</span>
            </div>
          </div>

          {/* 3. Interest Rate Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-blue-600" /> Interest Rate (% p.a.)
              </label>
              <span className="font-black text-slate-900 text-base font-mono">
                {interestRate}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={9.5}
              max={24}
              step={0.5}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>9.5%</span>
              <span>15%</span>
              <span>24%</span>
            </div>
          </div>

          {/* Educational Note */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Equated Monthly Installment (EMI)</strong> is calculated on a reducing balance basis. Lower tenure reduces total interest paid, while longer tenure lowers monthly outflow.
            </span>
          </div>
        </div>

        {/* Breakdown Output Summary Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                Estimated Monthly Outflow
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                {formatCurrency(calculations.emi)}
                <span className="text-sm font-semibold text-blue-300 ml-1">/month</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Principal Amount:</span>
                <span className="font-bold text-white">{formatCurrency(loanAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Interest:</span>
                <span className="font-bold text-amber-300">{formatCurrency(calculations.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Repayment:</span>
                <span className="font-bold text-white">{formatCurrency(calculations.totalRepayment)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Processing Fee (2%):</span>
                <span className="font-bold text-white">{formatCurrency(calculations.processingFee)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GST (18% on Fee):</span>
                <span className="font-bold text-white">{formatCurrency(calculations.gst)}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-white/10 text-sm font-bold text-emerald-400">
                <span>Estimated Net Payout:</span>
                <span>{formatCurrency(calculations.netDisbursement)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onApplyWithTerms}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all mt-2"
          >
            Apply With These Terms <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Disclaimer:</strong> Interest rates, loan amounts, tenure, fees and eligibility are subject to the customer's financial profile and the applicable terms at the time of application. Figures shown are illustrative estimates for educational purposes.
        </p>
      </div>
    </section>
  );
};

export default EmiCalculatorSection;
