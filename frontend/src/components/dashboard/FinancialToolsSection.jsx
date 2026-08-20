import React, { useState } from 'react';
import {
  Calculator,
  BarChart3,
  Lightbulb,
  ArrowRight,
  X,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

const FinancialToolsSection = ({ onScrollToEmi, onScrollToEligibility }) => {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const guideItems = [
    {
      term: 'CIBIL / Credit Score',
      desc: 'A 3-digit score (300–900) summarizing your repayment history. Scores of 700+ unlock lower rates and higher loan amounts.'
    },
    {
      term: 'Debt-to-Income (DTI) Ratio',
      desc: 'The percentage of your monthly income used to pay existing debts. A DTI below 40% ensures strong repayment safety.'
    },
    {
      term: 'Annual Percentage Rate (APR)',
      desc: 'The annualized cost of borrowing, incorporating both the annual interest rate and mandatory processing fees.'
    },
    {
      term: 'Tenure (Repayment Period)',
      desc: 'The total duration (in months) to repay your loan. Longer tenures reduce monthly EMI, while shorter tenures save overall interest.'
    },
    {
      term: 'Processing Fee & GST',
      desc: 'A one-time administrative fee (typically 2% + 18% GST) deducted directly from the gross sanctioned loan amount.'
    }
  ];

  return (
    <div id="financial-tools" className="space-y-4">
      <div>
        <h2 className="font-extrabold text-slate-900 text-lg">
          Financial Tools & Insights
        </h2>
        <p className="text-xs text-slate-500">
          Smart calculators and essential knowledge to help you make informed credit decisions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Tool 1: EMI Calculator */}
        <button
          type="button"
          onClick={onScrollToEmi}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all text-left group flex flex-col justify-between space-y-3 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
              EMI Calculator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate loan amounts, tenure, and monthly payments
            </p>
          </div>
        </button>

        {/* Tool 2: Eligibility */}
        <button
          type="button"
          onClick={onScrollToEligibility}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all text-left group flex flex-col justify-between space-y-3 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors">
              Eligibility Assessment
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluate your DTI, credit tier, and maximum borrowing limit
            </p>
          </div>
        </button>

        {/* Tool 3: Loan Guide */}
        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all text-left group flex flex-col justify-between space-y-3 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Lightbulb className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
              Borrower's Guide
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Essential glossary of credit terms, CIBIL, and fee structures
            </p>
          </div>
        </button>
      </div>

      {/* Loan Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    EZFINANZ Loan Guide
                  </h3>
                  <p className="text-xs text-slate-500">Key credit concepts explained simply</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {guideItems.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    {item.term}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialToolsSection;
