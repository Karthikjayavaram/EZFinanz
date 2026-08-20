import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Search, RotateCcw, FileText, ArrowRight, AlertCircle,
  X, SlidersHorizontal, CheckCircle2, Clock, XCircle,
  TrendingUp, Mail, Phone, Inbox, Banknote, Filter
} from 'lucide-react';

const AdminApplications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setRefreshing(true);
      setError('');
      const res = await api.get('/admin/applications');
      if (res.data.success) setApplications(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) setError('Session expired. Please log in again.');
      else if (err.response?.status === 403) setError('Access denied. Administrator privileges required.');
      else setError(err.response?.data?.message || 'Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const q = searchQuery.toLowerCase().trim();
      const name   = (app.kyc?.fullName || app.userId?.name || '').toLowerCase();
      const email  = (app.userId?.email || '').toLowerCase();
      const phone  = (app.userId?.phone || '').toLowerCase();
      const appNum = (app.applicationNumber || '').toLowerCase();
      const matchesSearch = !q || name.includes(q) || email.includes(q) || phone.includes(q) || appNum.includes(q);
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const matchesStage  = stageFilter === 'ALL'  || app.currentStage === stageFilter;
      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [applications, searchQuery, statusFilter, stageFilter]);

  const formatCurrency = val =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = dt =>
    dt ? new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const statusConfig = {
    APPROVED:  { label: 'Approved',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    PENDING:   { label: 'Pending',   cls: 'bg-amber-50  text-amber-800  border-amber-200',  dot: 'bg-amber-500'  },
    REJECTED:  { label: 'Rejected',  cls: 'bg-rose-50   text-rose-700   border-rose-200',   dot: 'bg-rose-500'   },
    DISBURSED: { label: 'Disbursed', cls: 'bg-blue-50   text-blue-700   border-blue-200',   dot: 'bg-blue-500'   },
    DRAFT:     { label: 'Draft',     cls: 'bg-slate-50  text-slate-600  border-slate-200',  dot: 'bg-slate-400'  },
  };

  const stageLabels = {
    WAITING_FOR_ADMIN: 'Waiting for Admin',
    SELFIE_SUBMITTED: 'Selfie Submitted',
    SELFIE_REJECTED: 'Selfie Rejected',
    APPLICATION_APPROVED: 'App Approved',
    APPLICATION_REJECTED: 'App Rejected',
    DISBURSEMENT_CONFIRMED: 'Disbursed',
    DECLARATION_ACCEPTED: 'Declaration Done',
    BANK_ACCOUNT_ADDED: 'Bank Added',
    EMI_SELECTED: 'EMI Selected',
    ELIGIBILITY_COMPLETED: 'Eligibility Done',
    KYC_COMPLETED: 'KYC Done',
    REGISTERED: 'Registered',
  };

  const stagesList = [
    { value: 'ALL',                    label: 'All Stages' },
    { value: 'WAITING_FOR_ADMIN',      label: 'Waiting for Admin' },
    { value: 'SELFIE_SUBMITTED',       label: 'Selfie Submitted' },
    { value: 'SELFIE_REJECTED',        label: 'Selfie Rejected' },
    { value: 'APPLICATION_APPROVED',   label: 'Application Approved' },
    { value: 'APPLICATION_REJECTED',   label: 'Application Rejected' },
    { value: 'DISBURSEMENT_CONFIRMED', label: 'Disbursement Confirmed' },
    { value: 'DECLARATION_ACCEPTED',   label: 'Declaration Accepted' },
    { value: 'BANK_ACCOUNT_ADDED',     label: 'Bank Account Added' },
    { value: 'EMI_SELECTED',           label: 'EMI Selected' },
    { value: 'ELIGIBILITY_COMPLETED',  label: 'Eligibility Completed' },
    { value: 'KYC_COMPLETED',          label: 'KYC Completed' },
    { value: 'REGISTERED',             label: 'Registered' },
  ];

  const clearFilters = () => { setSearchQuery(''); setStatusFilter('ALL'); setStageFilter('ALL'); };
  const hasFilters = searchQuery || statusFilter !== 'ALL' || stageFilter !== 'ALL';

  const counts = {
    ALL:      applications.length,
    PENDING:  applications.filter(a => a.status === 'PENDING').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
    DISBURSED:applications.filter(a => a.status === 'DISBURSED').length,
    DRAFT:    applications.filter(a => a.status === 'DRAFT').length,
  };

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-14 bg-slate-200 rounded-xl w-56" />
      <div className="h-16 bg-slate-200 rounded-2xl" />
      <div className="h-96 bg-slate-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Applications Queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review, evaluate, and process customer loan applications.</p>
        </div>
        <button
          onClick={fetchApplications}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition-all disabled:opacity-60"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Error ────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between gap-4 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3.5 rounded-xl text-sm">
          <span className="flex items-center gap-2 font-medium"><AlertCircle className="w-4 h-4 shrink-0" />{error}</span>
          <button onClick={fetchApplications} className="text-xs font-bold bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors">Retry</button>
        </div>
      )}

      {/* ── Quick Status Filter Tabs ─────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'ALL',      label: 'All',      dot: 'bg-slate-400' },
          { key: 'PENDING',  label: 'Pending',  dot: 'bg-amber-500' },
          { key: 'APPROVED', label: 'Approved', dot: 'bg-emerald-500' },
          { key: 'REJECTED', label: 'Rejected', dot: 'bg-rose-500' },
          { key: 'DISBURSED',label: 'Disbursed',dot: 'bg-blue-500' },
          { key: 'DRAFT',    label: 'Draft',    dot: 'bg-slate-300' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
              statusFilter === tab.key
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === tab.key ? 'bg-white/70' : tab.dot}`} />
            {tab.label}
            <span className={`text-[10px] font-black ${statusFilter === tab.key ? 'text-white/80' : 'text-slate-400'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search & Stage Filter ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex-1 min-w-56 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, or app ID…"
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stage filter */}
        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all appearance-none"
          >
            {stagesList.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Count & reset */}
        <div className="flex items-center gap-3 text-xs text-slate-500 ml-auto">
          <span><strong className="text-slate-700">{filteredApplications.length}</strong> of <strong className="text-slate-700">{applications.length}</strong> applications</span>
          {hasFilters && (
            <button onClick={clearFilters} className="text-indigo-600 font-bold hover:underline">Clear</button>
          )}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {['Ref #', 'Applicant', 'Loan Details', 'Stage', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredApplications.map(app => {
                const sc = statusConfig[app.status] || statusConfig.DRAFT;
                const isActionNeeded = app.currentStage === 'WAITING_FOR_ADMIN';
                return (
                  <tr
                    key={app._id}
                    onClick={() => navigate(`/admin/applications/${app._id}`)}
                    className={`group cursor-pointer transition-colors ${isActionNeeded ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-slate-50/70'}`}
                  >
                    {/* Ref */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {isActionNeeded && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />}
                        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          #{app.applicationNumber?.slice(-6)}
                        </span>
                      </div>
                    </td>

                    {/* Applicant */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black shrink-0 border border-indigo-200">
                          {(app.kyc?.fullName || app.userId?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                            {app.kyc?.fullName || app.userId?.name || 'Customer'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{app.userId?.email || '—'}</p>
                          {app.userId?.phone && (
                            <p className="text-[11px] text-slate-400">{app.userId.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Loan Details */}
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded inline-block mb-1 border border-indigo-100">
                          {app.loanType || 'Personal Loan'}
                        </span>
                        {app.loanDetails?.amount ? (
                          <>
                            <p className="text-xs font-bold text-slate-800">{formatCurrency(app.loanDetails.amount)}</p>
                            <p className="text-[11px] text-slate-400">{app.loanDetails.tenure} months · {app.loanDetails.interestRate}% p.a.</p>
                          </>
                        ) : (
                          <p className="text-slate-400 text-xs">Terms pending</p>
                        )}
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="px-5 py-4">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                        isActionNeeded
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {stageLabels[app.currentStage] || app.currentStage}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDate(app.submittedAt || app.createdAt)}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                        Review <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <Inbox className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">No applications found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter.</p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="mt-3 text-xs font-bold text-indigo-600 hover:underline">Clear all filters</button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredApplications.map(app => {
            const sc = statusConfig[app.status] || statusConfig.DRAFT;
            const isActionNeeded = app.currentStage === 'WAITING_FOR_ADMIN';
            return (
              <div
                key={app._id}
                onClick={() => navigate(`/admin/applications/${app._id}`)}
                className={`p-4 space-y-3 cursor-pointer active:bg-slate-50 ${isActionNeeded ? 'bg-amber-50/60' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isActionNeeded && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">#{app.applicationNumber?.slice(-6)}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sc.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-black shrink-0 border border-indigo-200">
                    {(app.kyc?.fullName || app.userId?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{app.kyc?.fullName || app.userId?.name || 'Customer'}</p>
                    <p className="text-xs text-slate-400">{app.userId?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl border border-slate-100 p-3 text-xs">
                  <div><span className="text-[10px] text-slate-400 block">Amount</span><span className="font-bold text-slate-800">{app.loanDetails?.amount ? formatCurrency(app.loanDetails.amount) : '—'}</span></div>
                  <div><span className="text-[10px] text-slate-400 block">Tenure</span><span className="font-bold text-slate-800">{app.loanDetails?.tenure ? `${app.loanDetails.tenure} mo` : '—'}</span></div>
                  <div><span className="text-[10px] text-slate-400 block">Date</span><span className="font-bold text-slate-800">{formatDate(app.submittedAt || app.createdAt)}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${isActionNeeded ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {stageLabels[app.currentStage] || app.currentStage}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">Review <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            );
          })}
          {filteredApplications.length === 0 && (
            <div className="p-12 text-center">
              <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-bold">No applications found</p>
            </div>
          )}
        </div>

        {/* Table footer */}
        {filteredApplications.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
            Showing <strong className="text-slate-600">{filteredApplications.length}</strong> application{filteredApplications.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplications;
