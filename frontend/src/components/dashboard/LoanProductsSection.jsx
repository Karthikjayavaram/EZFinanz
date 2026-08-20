import React, { useState } from 'react';
import {
  User,
  AlertTriangle,
  GraduationCap,
  HeartPulse,
  Plane,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
  Shield
} from 'lucide-react';

const LoanProductsSection = ({ onApplyClick }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    {
      id: 'personal',
      title: 'Personal Loan',
      category: 'Multi-Purpose',
      tag: 'Most Popular',
      icon: <User className="w-6 h-6 text-blue-600" />,
      tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description:
        'All-purpose digital personal loan for planned expenses, home improvement, debt consolidation, or unexpected needs.',
      features: [
        'Flexible repayment tenures (3 to 60 Months)',
        'Risk-adjusted interest rates based on profile',
        'Minimal digital documentation with instant KYC',
        'Direct disbursement to linked bank account'
      ],
      idealFor: 'Salaried & Self-employed individuals seeking general liquidity.'
    },
    {
      id: 'emergency',
      title: 'Emergency Loan',
      category: 'Urgent Liquidity',
      tag: 'Fast Processing',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description:
        'Fast-track short-term credit designed to handle sudden financial emergencies and urgent cash-flow requirements.',
      features: [
        'Quick credit score & DTI assessment',
        'Short to medium tenure options',
        'Transparent processing fee with no hidden fees',
        'Priority review queue by admin'
      ],
      idealFor: 'Urgent household repairs, unexpected bills, or cash bridge.'
    },
    {
      id: 'education',
      title: 'Education Loan',
      category: 'Skill & Academics',
      tag: 'Career Growth',
      icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
      tagColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      description:
        'Invest in your future with loans tailored for tuition fees, certification courses, textbooks, and academic supplies.',
      features: [
        'Affordable monthly EMI plans',
        'Designed for students & working professionals',
        'Simple income & guarantor assessment',
        'Digital disbursement per course milestone'
      ],
      idealFor: 'Higher education, professional upskilling, and tech bootcamps.'
    },
    {
      id: 'medical',
      title: 'Medical Loan',
      category: 'Healthcare',
      tag: 'Health & Wellness',
      icon: <HeartPulse className="w-6 h-6 text-rose-600" />,
      tagColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description:
        'Reliable medical financing for planned treatments, hospitalizations, surgeries, or emergency healthcare expenses.',
      features: [
        'Fast identity & income evaluation',
        'Flexible tenure to keep EMIs manageable',
        'Covers medical bills, prescriptions, & post-care',
        'Transparent repayment terms with KFS disclosure'
      ],
      idealFor: 'Elective surgeries, dental care, treatments, and medical emergencies.'
    },
    {
      id: 'travel',
      title: 'Travel & Lifestyle Loan',
      category: 'Leisure & Events',
      tag: 'Lifestyle',
      icon: <Plane className="w-6 h-6 text-emerald-600" />,
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description:
        'Fund your dream vacation, family holiday, destination wedding, or lifestyle purchase with manageable monthly EMIs.',
      features: [
        'Customizable loan amounts tailored to your budget',
        'Fixed monthly installments for predictable budgeting',
        'Complete digital loan agreement & declaration',
        'Direct bank transfer upon sanction'
      ],
      idealFor: 'Holiday packages, flight bookings, weddings, and gadget upgrades.'
    }
  ];

  return (
    <section id="loan-products" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Financing Solutions
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            EZFINANZ Loan Products
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Explore our curated digital personal loan options tailored for diverse life goals, urgent needs, and planned investments.
          </p>
        </div>

        <button
          onClick={onApplyClick}
          className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          Check My Eligibility <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {product.icon}
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${product.tagColor}`}
                >
                  {product.tag}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {product.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {product.title}
                </h3>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {product.features.slice(0, 2).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedProduct(product)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Learn More
              </button>

              <button
                type="button"
                onClick={onApplyClick}
                className="text-xs font-bold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors flex items-center gap-1"
              >
                Apply <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                  {selectedProduct.icon}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedProduct.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedProduct.description}
            </p>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Key Features & Terms
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                {selectedProduct.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Ideal For:</strong> {selectedProduct.idealFor}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  onApplyClick();
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                Proceed to Application <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LoanProductsSection;
