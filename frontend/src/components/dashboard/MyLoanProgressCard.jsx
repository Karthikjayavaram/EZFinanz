import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sliders,
  Building2,
  Calendar,
  Sparkles,
  Camera,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyLoanProgressCard = ({ application, onContinue, onRefresh, refreshing, starting }) => {
  const navigate = useNavigate();
  const [showSelfieModal, setShowSelfieModal] = useState(false);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Determine stage progression index (0 to 7)
  const getStageIndex = (stage, status) => {
    if (status === 'DISBURSED' || stage === 'DISBURSEMENT_CONFIRMED') {
      return 7;
    }
    if (status === 'APPROVED' || stage === 'APPLICATION_APPROVED') {
      return 6;
    }
    if (stage === 'WAITING_FOR_ADMIN' || stage === 'SELFIE_SUBMITTED' || (status === 'PENDING' && stage !== 'SELFIE_REJECTED')) {
      return 5;
    }
    if (stage === 'SELFIE_REJECTED') {
      return 4;
    }
    if (stage === 'DECLARATION_ACCEPTED' || stage === 'BANK_ACCOUNT_ADDED') {
      return 4;
    }
    if (stage === 'EMI_SELECTED') {
      return 3;
    }
    if (stage === 'ELIGIBILITY_COMPLETED') {
      return 2;
    }
    if (stage === 'KYC_COMPLETED') {
      return 1;
    }
    return 0;
  };

  const steps = [
    { label: 'KYC Details', key: 'KYC' },
    { label: 'Eligibility', key: 'ELIGIBILITY' },
    { label: 'Loan Terms', key: 'EMI' },
    { label: 'Bank & Declaration', key: 'BANK_DECLARATION' },
    { label: 'Live Photo', key: 'SELFIE' },
    { label: 'Admin Review', key: 'REVIEW' },
    { label: 'Sanction Approved', key: 'APPROVED' },
    { label: 'Disbursed', key: 'DISBURSED' }
  ];

  const currentIdx = getStageIndex(application?.currentStage, application?.status);
  const isDisbursed = application?.status === 'DISBURSED' || application?.currentStage === 'DISBURSEMENT_CONFIRMED';
  const progressPercent = isDisbursed ? 100 : Math.round((currentIdx / (steps.length - 1)) * 100);

  // Status Badge Configuration
  const getStatusBadge = () => {
    if (!application) {
      return {
        text: 'New Application',
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: <Clock className="w-3.5 h-3.5" />
      };
    }
    if (application.status === 'DISBURSED' || application.currentStage === 'DISBURSEMENT_CONFIRMED') {
      return {
        text: 'Loan Disbursed',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
      };
    }
    if (application.status === 'APPROVED' || application.currentStage === 'APPLICATION_APPROVED') {
      return {
        text: 'Sanction Approved',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      };
    }
    if (application.currentStage === 'SELFIE_REJECTED') {
      return {
        text: 'Selfie Needs Retake',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
      };
    }
    if (application.currentStage === 'WAITING_FOR_ADMIN' || application.status === 'PENDING') {
      return {
        text: 'Under Review',
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
      };
    }
    if (application.status === 'REJECTED') {
      return {
        text: 'Application Declined',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
      };
    }
    return {
      text: 'In Progress',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Clock className="w-3.5 h-3.5 text-blue-600" />
    };
  };

  const statusBadge = getStatusBadge();

  // ── Empty / no-application state for brand-new users ──────────────────
  if (!application) {
    return (
      <div id="my-loan-overview" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center py-10 space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-3xl shadow-sm">
            📋
          </div>
          <div className="space-y-2">
            <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl">
              No Active Loan Application
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              You haven't started a loan application yet. Apply now to get quick personal loans with competitive rates and zero hidden charges.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-500 py-2">
            <div className="space-y-1">
              <div className="text-2xl font-black text-blue-600">⚡</div>
              <span>Instant Approval</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-emerald-600">🔒</div>
              <span>Bank-Grade Security</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-indigo-600">💸</div>
              <span>Zero Hidden Fees</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onContinue}
            disabled={starting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-7 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer mt-2"
          >
            {starting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Creating Application…
              </>
            ) : (
              <>
                Start Your Application
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="my-loan-overview" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
      {/* Top Header: Application ID, Status, and Quick Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            📄
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {application?.loanType || 'Personal Loan'} Application
              </h2>
              {application?.applicationNumber && (
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  #{application.applicationNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isDisbursed ? steps.length : currentIdx + 1} of {steps.length} steps completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.color}`}>
            {statusBadge.icon}
            {statusBadge.text}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="Refresh application status"
          >
            <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Disbursed Celebration Banner (If Disbursed) */}
      {application?.status === 'DISBURSED' && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Loan Active
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {formatCurrency(application.loanDetails?.netDisbursement || application.loanDetails?.amount || 0)} Credited
                </h3>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
              {application.disbursementReference}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-black/20 p-3 rounded-xl border border-white/10">
            <div>
              <span className="text-emerald-200/80 block text-[11px]">Credited Bank</span>
              <span className="font-bold text-white truncate block">
                {application.bankAccount?.bankName} (•••• {application.bankAccount?.accountNumber?.slice(-4)})
              </span>
            </div>
            <div>
              <span className="text-emerald-200/80 block text-[11px]">Monthly EMI</span>
              <span className="font-bold text-white">
                {formatCurrency(application.loanDetails?.emi || 0)}/mo
              </span>
            </div>
            <div>
              <span className="text-emerald-200/80 block text-[11px]">Tenure</span>
              <span className="font-bold text-white">
                {application.loanDetails?.tenure || 0} Months
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Application Rejected Status Banner (Clean rejection notice without disclosing internal reasons) */}
      {application?.status === 'REJECTED' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
              <AlertCircle className="w-5 h-5 text-slate-600" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Application Status
              </span>
              <h3 className="text-base font-black text-slate-900">
                Application Not Approved
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thank you for applying with EZFINANZ. After reviewing your application, we are unable to approve your loan request at this time based on internal underwriting criteria. You may apply again after 90 days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selfie Rejected Alert (If Rejected) */}
      {application?.currentStage === 'SELFIE_REJECTED' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-rose-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-rose-950">
                Identity Photo Verification Required
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                <strong>Feedback:</strong> {application.adminReview?.selfieRejectionReason || 'Please retake photo in clear lighting.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/customer/selfie')}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            Retake Selfie →
          </button>
        </div>
      )}

      {/* Primary Financial Numbers (4 Key Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {application?.status === 'APPROVED' || application?.status === 'DISBURSED' ? 'Approved Amount' : 'Requested Amount'}
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block font-mono">
            {(application?.loanDetails?.amount || application?.eligibility?.calculatedEligibility?.approvedAmount)
              ? formatCurrency(application?.loanDetails?.amount || application?.eligibility?.calculatedEligibility?.approvedAmount)
              : <span className="text-slate-400 text-base">—</span>}
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Repayment Tenure
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block font-mono">
            {application?.loanDetails?.tenure
              ? `${application.loanDetails.tenure} Months`
              : <span className="text-slate-400 text-base">—</span>}
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Interest Rate
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block font-mono">
            {application?.loanDetails?.interestRate
              ? <>{application.loanDetails.interestRate}% <span className="text-xs font-semibold text-slate-400">p.a.</span></>
              : <span className="text-slate-400 text-base">—</span>}
          </span>
        </div>

        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Monthly EMI
          </span>
          <span className="text-lg sm:text-xl font-black text-blue-700 mt-0.5 block font-mono">
            {application?.loanDetails?.emi
              ? <>{formatCurrency(application.loanDetails.emi)}<span className="text-xs font-semibold text-blue-500">/mo</span></>
              : <span className="text-blue-300 text-base">—</span>}
          </span>
        </div>
      </div>

      {/* Visual Step Journey Tracker */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Application Journey</span>
          <span className="text-blue-600 font-mono">{progressPercent}% Complete</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Chips (Scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar text-xs">
          {steps.map((step, idx) => {
            const isCompleted = isDisbursed || idx < currentIdx;
            const isCurrent = !isDisbursed && idx === currentIdx;

            let chipStyle = 'bg-slate-50 text-slate-400 border-slate-200';
            if (isCompleted) chipStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
            if (isCurrent) chipStyle = 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs';

            return (
              <div
                key={idx}
                className={`px-3 py-1 rounded-xl border text-[11px] whitespace-nowrap flex items-center gap-1 shrink-0 ${chipStyle}`}
              >
                {isCompleted && <span>✓</span>}
                {isCurrent && <span>▶</span>}
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA for Active Applicants or Approved/Disbursed Loans */}
      {application?.status !== 'REJECTED' && (
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {application?.status === 'DISBURSED'
              ? 'Your loan has been successfully disbursed to your designated bank account.'
              : application?.status === 'APPROVED'
              ? 'Congratulations! Your loan has been approved and sanctioned by our underwriting team.'
              : application?.currentStage === 'WAITING_FOR_ADMIN'
              ? 'Your application is currently under review by our underwriting officers.'
              : 'Complete the remaining steps to get your loan sanctioned and disbursed.'}
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            {application?.status === 'APPROVED'
              ? 'View Sanction Letter'
              : application?.status === 'DISBURSED'
              ? 'View Sanction Terms'
              : 'Continue Application'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyLoanProgressCard;
