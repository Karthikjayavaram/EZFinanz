import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CompactFaqSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: 'How is my loan eligibility calculated?',
      a: 'Eligibility is calculated instantly based on your monthly income, existing debt obligations, Debt-to-Income (DTI) ratio, and credit score (CIBIL).'
    },
    {
      q: 'What is a CIBIL score and why does it matter?',
      a: 'A CIBIL score is a 3-digit number (300–900) reflecting your credit history. Scores above 700 qualify for higher amounts and lower risk-adjusted rates.'
    },
    {
      q: 'How is the monthly EMI calculated?',
      a: 'EMI is computed on a reducing-balance basis considering Principal, Monthly Interest Rate, and Tenure. Standard 2% processing fee and 18% GST are itemized clearly.'
    },
    {
      q: 'What happens after submitting my selfie?',
      a: 'Your application moves to "Under Review" where our underwriting officers inspect your live selfie and KYC documents for sanction approval.'
    },
    {
      q: 'When is the loan amount disbursed?',
      a: 'Immediately after admin sanction and simulated disbursement approval, funds are credited directly to your verified linked bank account with a reference ID.'
    }
  ];

  return (
    <div id="faq-section" className="space-y-4">
      <div>
        <h2 className="font-extrabold text-slate-900 text-lg">
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-slate-500">
          Quick answers to common questions about eligibility, process, and repayments
        </p>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-blue-300 shadow-xs ring-1 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer"
              >
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  {faq.q}
                </span>
                <span className="p-1 rounded-lg bg-slate-50 text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CompactFaqSection;
