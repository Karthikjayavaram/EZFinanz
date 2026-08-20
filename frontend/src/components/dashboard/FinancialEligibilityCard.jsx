import React from 'react';
import {
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinancialEligibilityCard = ({ eligibilityData, onCheckEligibility }) => {
  const navigate = useNavigate();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const hasData = eligibilityData?.calculatedEligibility || eligibilityData?.creditScore;

  const creditScore = eligibilityData?.creditScore || 750;
  const income = eligibilityData?.monthlyIncome || 0;
  const existingDebt = eligibilityData?.existingEmi || 0;
  const dti = eligibilityData?.calculatedEligibility?.dtiRatio || (income > 0 ? Math.round((existingDebt / income) * 100) : 0);
  const status = eligibilityData?.calculatedEligibility?.status || 'ELIGIBLE';

  const getScoreRating = (score) => {
    if (score >= 750) return { label: 'Excellent', color: 'text-emerald-600', bar: 'bg-emerald-500' };
    if (score >= 700) return { label: 'Good', color: 'text-blue-600', bar: 'bg-blue-500' };
    if (score >= 650) return { label: 'Fair', color: 'text-amber-600', bar: 'bg-amber-500' };
    return { label: 'Needs Improvement', color: 'text-rose-600', bar: 'bg-rose-500' };
  };

  const rating = getScoreRating(creditScore);

  const getStatusBadge = () => {
    if (status === 'ELIGIBLE') {
      return {
        label: '✓ Likely Eligible',
        style: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
    if (status === 'PARTIALLY_ELIGIBLE') {
      return {
        label: '⚠ Partially Eligible',
        style: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    }
    return {
      label: '✕ Not Eligible',
      style: 'bg-rose-50 text-rose-700 border-rose-200'
    };
  };

  const statusBadge = getStatusBadge();

  if (!hasData) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Understand Your Loan Eligibility
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete your employment and income details to view your personalized credit limit.
            </p>
          </div>
        </div>

        <button
          onClick={onCheckEligibility}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
        >
          Check Eligibility <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Your Financial Eligibility Profile
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on your submitted financial profile and credit assessment
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.style}`}>
          {statusBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Credit Score */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase">
            <span>CIBIL Score</span>
            <span className={rating.color}>{rating.label}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {creditScore} <span className="text-xs font-normal text-slate-400">/ 900</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${rating.bar}`}
              style={{ width: `${Math.min(100, Math.max(10, ((creditScore - 300) / 600) * 100))}%` }}
            />
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Monthly Income
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block font-mono">
            {formatCurrency(income)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Verified income</span>
        </div>

        {/* Existing Debt */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Existing Monthly Debt
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block font-mono">
            {formatCurrency(existingDebt)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Active obligations</span>
        </div>

        {/* DTI Ratio */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Debt-to-Income (DTI)
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-1 block font-mono">
            {dti}%
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {dti < 40 ? '✓ Healthy debt ratio' : 'Moderate debt ratio'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinancialEligibilityCard;
