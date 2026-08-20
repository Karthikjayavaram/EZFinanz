import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, ShieldCheck, CheckCircle2, XCircle, RotateCcw,
  AlertCircle, User, CreditCard, Building2, FileCheck, Camera,
  Eye, Lock, LogOut, Banknote, Activity, FileText, ChevronRight,
  Sparkles, Clock, AlertTriangle, Check
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const fmt = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

const fmtDate = (dt, extra = {}) =>
  dt ? new Date(dt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...extra }) : '—';

const maskId = (str) =>
  !str ? '—' : str.length <= 4 ? str : `${str.slice(0, 2)}${'*'.repeat(Math.max(4, str.length - 4))}${str.slice(-2)}`;

const maskAcc = (n) => (n ? `•••• ${n.slice(-4)}` : '—');

const STATUS = {
  APPROVED: { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Approved' },
  PENDING: { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Pending Review' },
  REJECTED: { bg: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rejected' },
  DISBURSED: { bg: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Disbursed' },
  DRAFT: { bg: 'bg-slate-400', text: 'text-slate-600', badge: 'bg-slate-50 text-slate-600 border-slate-200', label: 'Draft' },
};

const Badge = ({ status }) => {
  const c = STATUS[status] || STATUS.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${c.badge}`}>
      <span className={`w-2 h-2 rounded-full ${c.bg}`} />
      {c.label}
    </span>
  );
};

/* ═══════════════════════════════════════════════
   DATA ROW
═══════════════════════════════════════════════ */
const Row = ({ label, value, mono = false, highlight = '' }) => (
  <div className="flex items-start justify-between py-3.5 border-b border-slate-100 last:border-0 gap-4">
    <span className="text-xs text-slate-500 font-medium shrink-0 w-44">{label}</span>
    <span className={`text-xs font-bold text-right break-all ${mono ? 'font-mono' : ''} ${highlight || 'text-slate-800'}`}>
      {value ?? <span className="text-slate-300 font-normal">—</span>}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════
   CONFIRM MODAL
═══════════════════════════════════════════════ */
const Modal = ({ open, onClose, title, desc, icon, danger, loading, onConfirm, confirmLabel, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className={`flex items-start gap-3 px-6 py-5 border-b border-slate-100 ${danger ? 'bg-rose-50' : 'bg-slate-50'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">{title}</h3>
            {desc && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>}
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {children}
          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Processing…' : confirmLabel || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TABS CONFIGURATION
═══════════════════════════════════════════════ */
const TABS = [
  { key: 'selfie', label: 'Live Selfie & Photo Review', icon: <Camera className="w-4 h-4" /> },
  { key: 'kyc', label: 'KYC & Personal Info', icon: <User className="w-4 h-4" /> },
  { key: 'credit', label: 'Credit & Eligibility', icon: <Activity className="w-4 h-4" /> },
  { key: 'loan', label: 'Loan Terms & EMI', icon: <CreditCard className="w-4 h-4" /> },
  { key: 'bank', label: 'Bank & Disbursement', icon: <Building2 className="w-4 h-4" /> },
  { key: 'declaration', label: 'Legal & Declaration', icon: <FileCheck className="w-4 h-4" /> },
  { key: 'decision', label: 'Sanction & Decision Audit', icon: <ShieldCheck className="w-4 h-4" /> },
];

const Heading = ({ children }) => (
  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
    {children}
  </p>
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const AdminApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('selfie');

  // Modals
  const [selfieModalOpen, setSelfieModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [rejectSelfieModalOpen, setRejectSelfieModalOpen] = useState(false);
  const [selfieRejectReason, setSelfieRejectReason] = useState('');
  const [approveAppModalOpen, setApproveAppModalOpen] = useState(false);
  const [rejectAppModalOpen, setRejectAppModalOpen] = useState(false);
  const [appRejectReason, setAppRejectReason] = useState('');
  const [disburseModalOpen, setDisburseModalOpen] = useState(false);
  const [resetDecisionModalOpen, setResetDecisionModalOpen] = useState(false);

  useEffect(() => {
    fetchApp();
  }, [id]);

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const fetchApp = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/applications/${id}`);
      if (res.data.success) {
        setApplication(res.data.data);
        // Default tab smart selection
        if (res.data.data.currentStage === 'WAITING_FOR_ADMIN' || res.data.data.selfie?.url) {
          setActiveTab('selfie');
        } else {
          setActiveTab('kyc');
        }
      }
    } catch (err) {
      const st = err.response?.status;
      if (st === 401) setError('Session expired.');
      else if (st === 403) setError('Access denied. Administrator privileges required.');
      else if (st === 404) setError('Application not found.');
      else setError(err.response?.data?.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const act = async (fn) => {
    try {
      setActionLoading(true);
      setError('');
      await fn();
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveSelfie = () =>
    act(async () => {
      const r = await api.post(`/admin/applications/${id}/selfie-review`, { status: 'APPROVED' });
      setApplication(r.data.data);
      showSuccess('Live Selfie photo approved successfully.');
    });

  const handleRejectSelfie = () => {
    if (!selfieRejectReason.trim()) {
      setError('Please provide a reason for selfie rejection.');
      return;
    }
    act(async () => {
      const r = await api.post(`/admin/applications/${id}/selfie-review`, {
        status: 'REJECTED',
        reason: selfieRejectReason.trim(),
      });
      setApplication(r.data.data);
      setRejectSelfieModalOpen(false);
      setSelfieRejectReason('');
      showSuccess('Selfie rejected. Customer will be prompted to retake verification selfie.');
    });
  };

  const handleResetSelfie = () =>
    act(async () => {
      const r = await api.post(`/admin/applications/${id}/selfie-review`, { status: 'PENDING' });
      setApplication(r.data.data);
      showSuccess('Selfie review status reset to Pending.');
    });

  const handleApproveApp = () =>
    act(async () => {
      const r = await api.post(`/admin/applications/${id}/approve`);
      setApplication(r.data.data);
      setApproveAppModalOpen(false);
      showSuccess('Loan sanctioned and approved successfully!');
    });

  const handleRejectApp = () => {
    if (!appRejectReason.trim()) {
      setError('Please provide a reason for rejecting the loan.');
      return;
    }
    act(async () => {
      const r = await api.post(`/admin/applications/${id}/reject`, { reason: appRejectReason.trim() });
      setApplication(r.data.data);
      setRejectAppModalOpen(false);
      setAppRejectReason('');
      showSuccess('Application marked as Rejected.');
    });
  };

  const handleResetDecision = () =>
    act(async () => {
      const r = await api.post(`/admin/applications/${id}/reset-decision`);
      setApplication(r.data.data);
      setResetDecisionModalOpen(false);
      showSuccess('Loan decision reset back to Under Review (Pending).');
    });

  const handleDisburse = () =>
    act(async () => {
      const r = await api.post(`/admin/applications/${id}/disburse`);
      setApplication(r.data.data);
      setDisburseModalOpen(false);
      showSuccess(`Loan disbursed successfully! Reference ID: ${r.data.data.disbursementReference}`);
    });

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  /* ── Error / Auth Guard ── */
  if (!application) {
    const isAuth = error?.toLowerCase().includes('access') || error?.toLowerCase().includes('admin');
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
              isAuth ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-slate-900">{isAuth ? 'Admin Access Required' : 'Application Not Found'}</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isAuth ? 'Please sign in with an administrator account to review this application.' : error}
          </p>
          {isAuth ? (
            <button
              onClick={() => {
                localStorage.removeItem('userInfo');
                navigate('/login');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign In as Admin
            </button>
          ) : (
            <Link
              to="/admin/applications"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Queue
            </Link>
          )}
        </div>
      </div>
    );
  }

  const app = application;
  const selfieStatus = app.adminReview?.selfieStatus;
  const isDisbursed = app.status === 'DISBURSED';
  const isApproved = app.status === 'APPROVED';
  const isRejected = app.status === 'REJECTED';
  const isPending = app.status === 'PENDING';
  const needsAction = app.currentStage === 'WAITING_FOR_ADMIN';

  return (
    <div className="animate-fade-in space-y-6 pb-16">
      {/* ═══════════════════════════════════════════════════════
          1. STRUCTURED PROFILE BANNER & INTEGRATED ACTION BAR
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Applications Queue
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" /> Refresh Data
            </button>
          </div>
        </div>

        {/* Applicant Profile + Decision Action Buttons in Top Header */}
        <div className="p-6 sm:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-600/20 shrink-0">
              {(app.kyc?.fullName || app.userId?.name || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {app.kyc?.fullName || app.userId?.name || 'Customer'}
                </h1>
                <Badge status={app.status} />
                {needsAction && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-full border border-amber-300 animate-pulse">
                    ⚡ ACTION NEEDED
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3.5 mt-1.5 text-xs text-slate-500 font-medium">
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                  #{app.applicationNumber}
                </span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {app.loanType || 'Personal Loan'}
                </span>
                {app.userId?.email && <span>{app.userId.email}</span>}
                {app.userId?.phone && <span>• {app.userId.phone}</span>}
                <span>• Applied: {fmtDate(app.submittedAt || app.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Decision Buttons in Top Banner */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => setApproveAppModalOpen(true)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Sanction & Approve Loan
                </button>
                <button
                  type="button"
                  onClick={() => setRejectAppModalOpen(true)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Reject Loan
                </button>
              </>
            )}

            {isApproved && !isDisbursed && (
              <>
                <button
                  type="button"
                  onClick={() => setDisburseModalOpen(true)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Banknote className="w-4 h-4" /> Confirm Disbursement
                </button>
                <button
                  type="button"
                  onClick={() => setResetDecisionModalOpen(true)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Decision
                </button>
              </>
            )}

            {isRejected && (
              <>
                <button
                  type="button"
                  onClick={() => setApproveAppModalOpen(true)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" /> Overrule & Approve
                </button>
                <button
                  type="button"
                  onClick={() => setResetDecisionModalOpen(true)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to Pending
                </button>
              </>
            )}

            {isDisbursed && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Disbursed (Ref: {app.disbursementReference})
              </div>
            )}
          </div>
        </div>

        {/* Financial Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-100 bg-slate-50/50 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-4 sm:p-5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Requested / Sanctioned</span>
            <span className="text-base sm:text-lg font-black text-slate-900 block mt-0.5">
              {app.loanDetails?.amount ? fmt(app.loanDetails.amount) : '—'}
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Monthly EMI</span>
            <span className="text-base sm:text-lg font-black text-indigo-600 block mt-0.5">
              {app.loanDetails?.emi ? `${fmt(app.loanDetails.emi)}/mo` : '—'}
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tenure</span>
            <span className="text-base sm:text-lg font-black text-slate-900 block mt-0.5">
              {app.loanDetails?.tenure ? `${app.loanDetails.tenure} Months` : '—'}
            </span>
          </div>

          <div className="p-4 sm:p-5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">CIBIL Credit Score</span>
            <span className="text-base sm:text-lg font-black text-emerald-700 block mt-0.5">
              {app.eligibility?.creditScore ? `${app.eligibility.creditScore} (${app.eligibility?.creditRating || 'GOOD'})` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          APPLICATION PROGRESS TIMELINE CARDS (HEADINGS & STATUS ONLY)
      ═══════════════════════════════════════════════════════ */}
      {(() => {
        const timeline = [
          {
            key: 'kyc',
            tab: 'kyc',
            heading: 'KYC Verification',
            isCompleted: Boolean(app.kyc?.completedAt || (app.kyc?.fullName && app.kyc?.idNumber)),
          },
          {
            key: 'eligibility',
            tab: 'credit',
            heading: 'Eligibility Check',
            isCompleted: Boolean(app.eligibility?.calculatedAt || app.eligibility?.status || app.eligibility?.creditScore),
          },
          {
            key: 'loan',
            tab: 'loan',
            heading: 'Loan & EMI Terms',
            isCompleted: Boolean(app.loanDetails?.amount && app.loanDetails?.tenure && app.loanDetails?.emi),
          },
          {
            key: 'bank',
            tab: 'bank',
            heading: 'Bank Account',
            isCompleted: Boolean(app.bankAccount?.accountNumber && app.bankAccount?.ifsc),
          },
          {
            key: 'declaration',
            tab: 'declaration',
            heading: 'Declaration & Consent',
            isCompleted: Boolean(app.declaration?.accepted),
          },
          {
            key: 'selfie',
            tab: 'selfie',
            heading: 'Live Selfie Photo',
            isCompleted: Boolean(app.selfie?.url && app.adminReview?.selfieStatus === 'APPROVED'),
            isPendingReview: Boolean(app.selfie?.url && app.adminReview?.selfieStatus !== 'APPROVED'),
          },
          {
            key: 'decision',
            tab: 'decision',
            heading: 'Admin Sanction',
            isCompleted: Boolean(app.status === 'APPROVED' || app.status === 'DISBURSED'),
          },
          {
            key: 'disbursement',
            tab: 'bank',
            heading: 'Loan Disbursement',
            isCompleted: Boolean(app.status === 'DISBURSED'),
          },
        ];

        const completedCount = timeline.filter((s) => s.isCompleted).length;

        return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Application Timeline
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  ({completedCount} of {timeline.length} Completed)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Not Completed
                </span>
              </div>
            </div>

            {/* Timeline Cards Grid (Only Heading and Completed/Not Completed Status) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {timeline.map((step, idx) => (
                <div
                  key={step.key}
                  onClick={() => step.tab && setActiveTab(step.tab)}
                  className={`bg-white p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                    step.isCompleted
                      ? 'border-emerald-500 bg-white hover:shadow-sm'
                      : step.isPendingReview
                      ? 'border-amber-400 bg-white hover:shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">
                      Step {idx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {step.heading}
                    </h3>
                  </div>

                  <div>
                    {step.isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" /> Completed
                      </span>
                    ) : step.isPendingReview ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Under Review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        Not Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════
          TOAST NOTIFICATIONS
      ═══════════════════════════════════════════════════════ */}
      {successMessage && (
        <div className="flex items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-2xl text-xs font-bold shadow-2xs">
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-800 text-xs">
            ✕
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-between gap-4 bg-rose-50 border border-rose-200 text-rose-800 px-5 py-3.5 rounded-2xl text-xs font-bold shadow-2xs">
          <span className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </span>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-800 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          2. UNIFIED WORKSPACE (TABS + CONSOLE)
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 px-4 border-b border-slate-200 overflow-x-auto bg-slate-50/50">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-4 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.key === 'selfie' && needsAction && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body Content */}
        <div className="p-6 sm:p-8">
          {/* ── TAB 1: LIVE SELFIE & IDENTITY REVIEW ── */}
          {activeTab === 'selfie' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Live Photo & Biometric Verification</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compare applicant's live camera capture against submitted KYC documents.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Review Status:</span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      selfieStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selfieStatus === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {selfieStatus || 'PENDING REVIEW'}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison (Equal 50% / 50% Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* 1. Live Selfie Capture */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-indigo-600" /> Live Selfie Capture
                      </span>
                      {app.selfie?.submittedAt && (
                        <span className="text-[11px] text-slate-400">
                          {fmtDate(app.selfie.submittedAt, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {app.selfie?.url ? (
                      <div className="space-y-3">
                        <div
                          onClick={() => setSelfieModalOpen(true)}
                          className="relative group aspect-[4/3] w-full bg-slate-950 rounded-2xl overflow-hidden cursor-pointer shadow-inner flex items-center justify-center"
                        >
                          <img
                            src={app.selfie.url}
                            alt="Customer Live Selfie"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <Eye className="w-4 h-4" /> Click to Enlarge
                          </div>
                        </div>

                        {app.adminReview?.selfieRejectionReason && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                            <strong>Rejection Note:</strong> {app.adminReview.selfieRejectionReason}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 space-y-1.5">
                        <Camera className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-600 text-xs">No Live Selfie Uploaded</p>
                        <p className="text-[11px]">The applicant has not reached the photo step yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Photo Review Action Controls (Pinned to Bottom) */}
                  {app.selfie?.url && !isDisbursed && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2.5 mt-auto">
                      {selfieStatus === 'APPROVED' ? (
                        <>
                          <div className="flex-1 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-800 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            Photo Approved
                          </div>
                          <button
                            type="button"
                            onClick={() => setRejectSelfieModalOpen(true)}
                            disabled={actionLoading}
                            className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={handleResetSelfie}
                            disabled={actionLoading}
                            className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                          >
                            Reset
                          </button>
                        </>
                      ) : selfieStatus === 'REJECTED' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleApproveSelfie}
                            disabled={actionLoading}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                          >
                            Change to Approved
                          </button>
                          <button
                            type="button"
                            onClick={handleResetSelfie}
                            disabled={actionLoading}
                            className="py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                          >
                            Reset
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleApproveSelfie}
                            disabled={actionLoading}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve Selfie
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectSelfieModalOpen(true)}
                            disabled={actionLoading}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" /> Reject Selfie
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. KYC ID Document Comparison */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-600" /> Submitted ID Document ({app.kyc?.idType || 'PAN'})
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {maskId(app.kyc?.idNumber)}
                      </span>
                    </div>

                    {app.kyc?.idDocumentUrl ? (
                      <div className="space-y-3">
                        <div
                          onClick={() => setDocModalOpen(true)}
                          className="relative group aspect-[4/3] w-full bg-slate-950 rounded-2xl overflow-hidden cursor-pointer shadow-inner flex items-center justify-center"
                        >
                          <img
                            src={app.kyc.idDocumentUrl}
                            alt="Submitted ID Proof"
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <Eye className="w-4 h-4" /> Click to Enlarge ID
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 space-y-1.5">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-600 text-xs">No Document Proof Uploaded</p>
                        <p className="text-[11px]">Applicant details were verified via direct database lookup.</p>
                      </div>
                    )}
                  </div>

                  {/* Verification Helper Note (Pinned to Bottom) */}
                  <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200 mt-auto">
                    Verify that the name <strong>{app.kyc?.fullName || '—'}</strong> and DOB{' '}
                    <strong>
                      {app.kyc?.dob ? new Date(app.kyc.dob).toLocaleDateString('en-IN') : '—'}
                    </strong>{' '}
                    match the applicant's live facial features and biometric scan.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: KYC & PERSONAL INFO ── */}
          {activeTab === 'kyc' && (
            <div className="space-y-4 max-w-4xl">
              <Heading>Identity & Contact Details</Heading>
              <Row label="Full Name" value={app.kyc?.fullName || app.userId?.name} />
              <Row label="Gender" value={app.kyc?.gender} />
              <Row
                label="Date of Birth"
                value={app.kyc?.dob ? new Date(app.kyc.dob).toLocaleDateString('en-IN') : null}
              />
              <Row label="ID Document Type" value={app.kyc?.idType} />
              <Row label="ID Number" value={maskId(app.kyc?.idNumber)} mono />
              <Row label="Registered Email" value={app.userId?.email} />
              <Row label="Phone Number" value={app.userId?.phone} />
              <Row label="Residential Address" value={app.kyc?.address} />

              {app.kyc?.idDocumentUrl && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setDocModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> View ID Document Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: CREDIT & ELIGIBILITY ── */}
          {activeTab === 'credit' && (
            <div className="space-y-4 max-w-4xl">
              <Heading>Underwriting & Credit Assessment</Heading>
              {app.eligibility?.status ? (
                <>
                  <Row
                    label="Assessment Status"
                    value={
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          app.eligibility.status === 'ELIGIBLE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.eligibility.status === 'PARTIALLY_ELIGIBLE'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {app.eligibility.status}
                      </span>
                    }
                  />
                  <Row label="Monthly Net Income" value={fmt(app.eligibility?.monthlyIncome)} />
                  <Row label="Existing Monthly Debt" value={fmt(app.eligibility?.monthlyDebt)} />
                  <Row label="Debt-to-Income (DTI)" value={app.eligibility?.dti ? `${app.eligibility.dti}%` : null} />
                  <Row
                    label="CIBIL Credit Score"
                    value={`${app.eligibility?.creditScore} (${app.eligibility?.creditRating || 'GOOD'})`}
                    highlight="text-indigo-600 font-black"
                  />
                  <Row
                    label="Max Calculated Limit"
                    value={fmt(app.eligibility?.maxEligibleAmount)}
                    highlight="text-emerald-700 font-black"
                  />
                  <Row
                    label="Risk-Adjusted Rate"
                    value={`${app.eligibility?.applicableInterestRate || 12.5}% p.a.`}
                  />
                  <Row label="Employer Name" value={app.eligibility?.employerName} />
                  <Row label="Designation" value={app.eligibility?.designation} />

                  {app.eligibility?.reasons?.length > 0 && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <p className="text-xs font-bold text-slate-700 mb-2">Automated Underwriting Notes:</p>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {app.eligibility.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">Eligibility data not available yet.</p>
              )}
            </div>
          )}

          {/* ── TAB 4: LOAN TERMS & EMI ── */}
          {activeTab === 'loan' && (
            <div className="space-y-4 max-w-4xl">
              <Heading>Loan Structuring & Repayment Schedule</Heading>
              {app.loanDetails?.amount ? (
                <>
                  <Row label="Principal Loan Amount" value={fmt(app.loanDetails.amount)} highlight="text-slate-900 font-black" />
                  <Row label="Monthly EMI Payment" value={`${fmt(app.loanDetails.emi)} / month`} highlight="text-indigo-600 font-black" />
                  <Row label="Loan Tenure" value={`${app.loanDetails.tenure} Months`} />
                  <Row label="Net Disbursal Amount" value={fmt(app.loanDetails.netDisbursement)} highlight="text-emerald-700 font-black" />
                  <Row label="Annual Interest Rate" value={`${app.loanDetails.interestRate}% p.a.`} />
                  <Row label="Total Interest Payable" value={fmt(app.loanDetails.totalInterest)} />
                  <Row label="Total Repayment (Principal + Interest)" value={fmt(app.loanDetails.totalRepayment)} />
                  <Row label="Processing Fee (2%)" value={fmt(app.loanDetails.processingFee)} />
                  <Row label="GST (18% on Fee)" value={fmt(app.loanDetails.gst)} />
                  <Row label="Effective Annual IRR" value={`${app.loanDetails.irr}% p.a.`} />
                </>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">Loan terms not selected yet.</p>
              )}
            </div>
          )}

          {/* ── TAB 5: BANK & DISBURSEMENT ── */}
          {activeTab === 'bank' && (
            <div className="space-y-4 max-w-4xl">
              <Heading>Disbursement & e-NACH Bank Account</Heading>
              {app.bankAccount?.accountNumber ? (
                <>
                  <Row label="Bank Name" value={app.bankAccount.bankName} />
                  <Row label="Account Number" value={maskAcc(app.bankAccount.accountNumber)} mono />
                  <Row label="Account Holder Name" value={app.bankAccount.accountHolderName} />
                  <Row label="IFSC Code" value={app.bankAccount.ifsc} mono highlight="text-indigo-600" />
                  <Row label="Account Type" value={app.bankAccount.accountType} />
                  {app.bankAccount.branchName && <Row label="Branch Name" value={app.bankAccount.branchName} />}

                  {isDisbursed && app.disbursementReference && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl space-y-2">
                      <p className="text-xs font-black text-indigo-950">Official Disbursement Confirmation</p>
                      <Row label="Transaction Reference" value={app.disbursementReference} mono highlight="text-indigo-700" />
                      <Row label="Disbursed Timestamp" value={fmtDate(app.disbursedAt, { hour: '2-digit', minute: '2-digit' })} />
                      <Row label="Disbursed Amount" value={fmt(app.loanDetails?.netDisbursement || app.loanDetails?.amount)} highlight="text-emerald-700 font-black" />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 py-8 text-center">Bank details not submitted yet.</p>
              )}
            </div>
          )}

          {/* ── TAB 6: DECLARATION & LEGAL ── */}
          {activeTab === 'declaration' && (
            <div className="space-y-4 max-w-4xl">
              <Heading>Borrower Legal Undertaking & Consent</Heading>
              <Row
                label="Declaration Status"
                value={app.declaration?.accepted ? '✓ Accepted by Applicant' : '✕ Pending Acceptance'}
                highlight={app.declaration?.accepted ? 'text-emerald-700 font-bold' : 'text-rose-600'}
              />
              <Row label="Key Fact Statement (KFS)" value={app.declaration?.version || 'KFS-v2026.1'} />
              <Row
                label="Timestamp of Consent"
                value={fmtDate(app.declaration?.acceptedAt, { hour: '2-digit', minute: '2-digit' })}
              />
            </div>
          )}

          {/* ── TAB 7: SANCTION & AUDIT ── */}
          {activeTab === 'decision' && (
            <div className="space-y-4 max-w-4xl">
              <Heading>Sanction Status & Review Trail</Heading>
              <Row label="Current Sanction State" value={<Badge status={app.status} />} />
              <Row label="Application Flow Stage" value={app.currentStage} mono />
              {app.approvedAt && <Row label="Sanction Approval Date" value={fmtDate(app.approvedAt)} />}
              {app.disbursedAt && <Row label="Disbursement Date" value={fmtDate(app.disbursedAt)} />}
              {app.rejectedAt && <Row label="Rejection Date" value={fmtDate(app.rejectedAt)} highlight="text-rose-600" />}

              {app.adminReview?.applicationRejectionReason && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900">
                  <strong>Rejection Rationale:</strong> {app.adminReview.applicationRejectionReason}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MODALS & DIALOGS
      ═══════════════════════════════════════════════════════ */}

      {/* Selfie Enlarge Modal */}
      {selfieModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setSelfieModalOpen(false)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={app.selfie?.url} alt="Selfie Enlarge" className="w-full rounded-2xl shadow-2xl" />
            <button
              onClick={() => setSelfieModalOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-700 font-bold shadow-lg text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ID Document Enlarge Modal */}
      {docModalOpen && app.kyc?.idDocumentUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setDocModalOpen(false)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={app.kyc.idDocumentUrl} alt="ID Document Enlarge" className="w-full rounded-2xl shadow-2xl" />
            <button
              onClick={() => setDocModalOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-700 font-bold shadow-lg text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Reject Selfie Dialog */}
      <Modal
        open={rejectSelfieModalOpen}
        onClose={() => {
          setRejectSelfieModalOpen(false);
          setSelfieRejectReason('');
        }}
        title="Reject Live Selfie"
        desc="The applicant will be requested to retake their photo verification."
        icon={<Camera className="w-5 h-5" />}
        danger
        loading={actionLoading}
        onConfirm={handleRejectSelfie}
        confirmLabel="Confirm Rejection"
      >
        <textarea
          value={selfieRejectReason}
          onChange={(e) => setSelfieRejectReason(e.target.value)}
          rows={3}
          placeholder="e.g. Face is blurry, lighting is insufficient, glare on lens…"
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
        />
        {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
      </Modal>

      {/* Approve Loan Dialog */}
      <Modal
        open={approveAppModalOpen}
        onClose={() => setApproveAppModalOpen(false)}
        title="Sanction & Approve Loan"
        desc="Confirm credit facility sanction for this applicant."
        icon={<ShieldCheck className="w-5 h-5" />}
        loading={actionLoading}
        onConfirm={handleApproveApp}
        confirmLabel="Confirm Approval"
      >
        <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
          {[
            ['Applicant Name', app.kyc?.fullName || app.userId?.name],
            ['Sanction Amount', fmt(app.loanDetails?.amount)],
            ['Monthly EMI', `${fmt(app.loanDetails?.emi)}/mo`],
            ['Tenure', `${app.loanDetails?.tenure} Months`],
            ['Net Disbursement', fmt(app.loanDetails?.netDisbursement)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-2.5">
              <span className="text-slate-500">{k}</span>
              <span className="font-bold text-slate-900">{v || '—'}</span>
            </div>
          ))}
        </div>
        {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
      </Modal>

      {/* Reject Loan Dialog */}
      <Modal
        open={rejectAppModalOpen}
        onClose={() => {
          setRejectAppModalOpen(false);
          setAppRejectReason('');
        }}
        title="Reject Loan Application"
        desc="Applicant will be notified of the decision along with the reason."
        icon={<XCircle className="w-5 h-5" />}
        danger
        loading={actionLoading}
        onConfirm={handleRejectApp}
        confirmLabel="Confirm Rejection"
      >
        <textarea
          value={appRejectReason}
          onChange={(e) => setAppRejectReason(e.target.value)}
          rows={3}
          placeholder="e.g. Debt-to-income ratio exceeds underwriting threshold, credit score below policy limit…"
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
        />
        {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
      </Modal>

      {/* Disburse Dialog */}
      <Modal
        open={disburseModalOpen}
        onClose={() => setDisburseModalOpen(false)}
        title="Confirm Disbursement"
        desc="Funds will be transferred to the verified disbursement bank account."
        icon={<Banknote className="w-5 h-5" />}
        loading={actionLoading}
        onConfirm={handleDisburse}
        confirmLabel="Confirm Disbursement"
      >
        <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
          {[
            ['Beneficiary', app.kyc?.fullName || app.userId?.name],
            ['Bank Name', app.bankAccount?.bankName],
            ['Account Number', maskAcc(app.bankAccount?.accountNumber)],
            ['IFSC Code', app.bankAccount?.ifsc],
            ['Disbursal Amount', fmt(app.loanDetails?.netDisbursement || app.loanDetails?.amount)],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-2.5">
              <span className="text-slate-500">{k}</span>
              <span className="font-bold text-slate-900">{v || '—'}</span>
            </div>
          ))}
        </div>
        {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
      </Modal>

      {/* Reset Decision Dialog */}
      <Modal
        open={resetDecisionModalOpen}
        onClose={() => setResetDecisionModalOpen(false)}
        title="Reset to Under Review"
        desc="Clears approval/rejection state and returns application to Under Review."
        icon={<RotateCcw className="w-5 h-5" />}
        danger
        loading={actionLoading}
        onConfirm={handleResetDecision}
        confirmLabel="Confirm Reset"
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to reset this loan decision back to <strong>Under Review (Pending)</strong>? This will clear the sanction/rejection state and allow re-evaluation.
        </p>
        {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
      </Modal>
    </div>
  );
};

export default AdminApplicationDetail;
