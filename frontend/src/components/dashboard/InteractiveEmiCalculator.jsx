import React, { useState, useMemo } from 'react';
import {
  Calculator,
  IndianRupee,
  Calendar,
  Percent,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const InteractiveEmiCalculator = ({ onApplyWithTerms }) => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [interestRate, setInterestRate] = useState(12.5);

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
    const principalPct = totalRepayment > 0 ? Math.round((P / totalRepayment) * 100) : 100;
    const interestPct = 100 - principalPct;

    return {
      emi,
      totalInterest,
      totalRepayment,
      principalPct,
      interestPct
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
    <div id="emi-calculator-card" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
              Plan Your EMI & Repayment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize loan terms to find a monthly installment that fits your budget
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onApplyWithTerms}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Apply with these terms <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Amount Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-blue-600" /> Loan Amount
              </span>
              <span className="text-slate-900 font-mono text-base font-black">
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
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>₹10,000</span>
              <span>₹5,00,000</span>
              <span>₹10,00,000</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Tenure
              </span>
              <span className="text-slate-900 font-mono text-base font-black">
                {tenureMonths} Months
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
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>3 Months</span>
              <span>36 Months</span>
              <span>60 Months</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-blue-600" /> Interest Rate (% p.a.)
              </span>
              <span className="text-slate-900 font-mono text-base font-black">
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
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>9.5%</span>
              <span>15%</span>
              <span>24%</span>
            </div>
          </div>
        </div>

        {/* Prominent Monthly EMI Output Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 space-y-4 shadow-md">
          <div>
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
              Estimated Monthly EMI
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-0.5">
              {formatCurrency(calculations.emi)}
              <span className="text-xs font-normal text-blue-300 ml-1">/month</span>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
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
          </div>

          {/* Visual Breakdown Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Principal ({calculations.principalPct}%)</span>
              <span>Interest ({calculations.interestPct}%)</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full flex overflow-hidden">
              <div className="bg-blue-400 h-full" style={{ width: `${calculations.principalPct}%` }} />
              <div className="bg-amber-400 h-full" style={{ width: `${calculations.interestPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
        <span>
          <strong>Disclaimer:</strong> Figures shown are indicative estimates for planning purposes. Final interest rate, tenure, and EMI are determined by your underwriting profile at sanction.
        </span>
      </div>
    </div>
  );
};

export default InteractiveEmiCalculator;
