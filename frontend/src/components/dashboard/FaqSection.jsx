import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageCircleQuestion
} from 'lucide-react';

const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'What is a personal loan?',
      a: 'A personal loan is an unsecured digital credit facility that you can use for various personal financial needs such as home renovations, medical expenses, travel, debt consolidation, or unexpected emergencies without pledging collateral.'
    },
    {
      q: 'How does the EZFINANZ loan application work?',
      a: 'The process is 100% digital: (1) Register your account, (2) Verify email & phone via OTP, (3) Enter KYC details, (4) Evaluate financial eligibility, (5) Customize loan terms & EMI, (6) Link disbursement bank account, (7) Accept the declaration, and (8) Submit a live verification selfie for admin approval.'
    },
    {
      q: 'What documents are required for KYC?',
      a: 'You will need a valid government-issued photo ID (such as PAN or Aadhaar card number), proof of address, and an optional image copy of your document for instant digital verification.'
    },
    {
      q: 'How is loan eligibility calculated?',
      a: 'Our underwriting engine calculates eligibility based on your monthly or annual income, existing debt obligations, Debt-to-Income (DTI) ratio, and credit score (CIBIL). This determines your maximum pre-approved amount and applicable interest rate.'
    },
    {
      q: 'What is a CIBIL credit score?',
      a: 'A CIBIL credit score is a 3-digit numeric summary (ranging from 300 to 900) that reflects your past credit behavior and repayment discipline. A higher credit score (700+) qualifies you for better loan limits and competitive rates.'
    },
    {
      q: 'What is the Debt-to-Income (DTI) ratio?',
      a: 'The DTI ratio measures the percentage of your monthly gross income committed to servicing existing debts and EMIs. An ideal DTI ratio is under 40% to 50% to ensure you have sufficient disposable income for new repayments.'
    },
    {
      q: 'How is the monthly EMI calculated?',
      a: 'EMI (Equated Monthly Installment) is calculated using standard reducing-balance math based on Principal, Monthly Interest Rate, and Tenure in months. Full fees (2% processing fee and 18% GST) are transparently itemized.'
    },
    {
      q: 'Can I track my application status in real time?',
      a: 'Yes. Your Customer Dashboard displays live stage indicators from initial submission through admin review, selfie verification, sanction approval, and final fund disbursement.'
    },
    {
      q: 'What happens after submitting my selfie?',
      a: 'Once your live photo verification is uploaded, your application moves to "Waiting for Admin Review" where our underwriting officers inspect the photo and identity documents for sanction approval.'
    },
    {
      q: 'How does loan disbursement work?',
      a: 'Once approved, the admin triggers fund transfer to your verified linked bank account. The system generates a simulated disbursement reference number (e.g. EZFDISB-XXXXXXXX) and records the timestamp.'
    },
    {
      q: 'Can my application be rejected?',
      a: 'Yes. Applications may be declined if credit requirements, high DTI ratios (>50%), or incomplete identity information do not meet policy benchmarks. The reason for decline is displayed in your dashboard.'
    },
    {
      q: 'What happens if my selfie is rejected?',
      a: 'If a photo is blurry or improperly lit, the admin marks it as rejected with feedback. Your dashboard immediately notifies you with the reason and allows you to retake and resubmit a clearer photo.'
    }
  ];

  const toggleAccordion = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section id="faqs" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
          <MessageCircleQuestion className="w-3.5 h-3.5" />
          Got Questions?
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Everything you need to know about our personal loan products, eligibility evaluation, and digital process.
        </p>
      </div>

      {/* Accordion List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-blue-300 shadow-sm ring-1 ring-blue-100'
                  : 'border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-3"
              >
                <span className="font-bold text-slate-900 text-sm flex items-start gap-2.5">
                  <span className="text-blue-600 font-mono text-xs mt-0.5">Q{idx + 1}.</span>
                  <span>{faq.q}</span>
                </span>
                <span className="p-1 rounded-lg bg-slate-50 text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  <p className="pl-6 border-l-2 border-blue-500 py-0.5">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
