import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Clock, CheckCircle2, XCircle, TrendingUp,
  ArrowRight, RotateCcw, ShieldCheck, FileText,
  AlertCircle, IndianRupee, Activity, Inbox, Banknote
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError('');
      const res = await api.get('/admin/applications');
      if (res.data.success) setApplications(res.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) setError('Session expired. Please log in again.');
      else if (err.response?.status === 403) setError('Access denied. Administrator privileges required.');
      else setError(err.response?.data?.message || 'Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const total     = applications.length;
  const pending   = applications.filter(a => a.status === 'PENDING').length;
  const approved  = applications.filter(a => a.status === 'APPROVED').length;
  const rejected  = applications.filter(a => a.status === 'REJECTED').length;
  const disbursed = applications.filter(a => a.status === 'DISBURSED').length;
  const draft     = applications.filter(a => a.status === 'DRAFT').length;

  const totalDisbursedAmount = applications
    .filter(a => a.status === 'DISBURSED')
    .reduce((acc, curr) => acc + (curr.loanDetails?.amount || 0), 0);

  const formatCurrency = val =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = dt =>
    dt ? new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const statusConfig = {
    APPROVED:  { label: 'Approved',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    PENDING:   { label: 'Pending',    cls: 'bg-amber-50  text-amber-800  border-amber-200',  dot: 'bg-amber-500'  },
    REJECTED:  { label: 'Rejected',   cls: 'bg-rose-50   text-rose-700   border-rose-200',   dot: 'bg-rose-500'   },
    DISBURSED: { label: 'Disbursed',  cls: 'bg-blue-50   text-blue-700   border-blue-200',   dot: 'bg-blue-500'   },
    DRAFT:     { label: 'Draft',      cls: 'bg-slate-50  text-slate-600  border-slate-200',  dot: 'bg-slate-400'  },
  };

  const getPriorityLabel = app => {
    if (app.currentStage === 'WAITING_FOR_ADMIN') return { label: 'ACTION NEEDED', cls: 'bg-rose-100 text-rose-700 border-rose-200' };
    if (app.status === 'PENDING') return { label: 'PENDING',  cls: 'bg-amber-100 text-amber-700 border-amber-200' };
    return null;
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
      </div>
      <div className="h-80 bg-slate-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 shadow-sm transition-all disabled:opacity-60"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/25 transition-all"
          >
            View Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between gap-4 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3.5 rounded-xl text-sm">
          <span className="flex items-center gap-2 font-medium"><AlertCircle className="w-4 h-4 shrink-0" />{error}</span>
          <button onClick={fetchDashboardData} className="text-xs font-bold bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors">Retry</button>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total',     value: total,     sub: 'All applications',       icon: <Inbox className="w-4 h-4" />,       iconBg: 'bg-slate-100 text-slate-600',  valCls: 'text-slate-900' },
          { label: 'Pending',   value: pending,   sub: 'Needs review',           icon: <Clock className="w-4 h-4" />,       iconBg: 'bg-amber-50  text-amber-600',  valCls: pending > 0 ? 'text-amber-600' : 'text-slate-900' },
          { label: 'Approved',  value: approved,  sub: 'Sanction cleared',       icon: <CheckCircle2 className="w-4 h-4" />, iconBg: 'bg-emerald-50 text-emerald-600', valCls: 'text-emerald-600' },
          { label: 'Rejected',  value: rejected,  sub: 'Declined',               icon: <XCircle className="w-4 h-4" />,     iconBg: 'bg-rose-50   text-rose-600',   valCls: rejected > 0 ? 'text-rose-600' : 'text-slate-900' },
          { label: 'Disbursed', value: disbursed, sub: formatCurrency(totalDisbursedAmount), icon: <Banknote className="w-4 h-4" />, iconBg: 'bg-blue-50 text-blue-600', valCls: 'text-blue-600' },
        ].map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl border p-5 space-y-3 shadow-sm transition-all ${pending > 0 && card.label === 'Pending' ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>{card.icon}</div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${card.valCls}`}>{card.value}</div>
            <span className="text-[11px] text-slate-400 block truncate">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Recent Applications Table ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Recent Applications</h2>
              <p className="text-[11px] text-slate-400">Latest submissions &amp; in-progress loans</p>
            </div>
          </div>
          <Link to="/admin/applications" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 hover:underline">
            View All ({total}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['#', 'Applicant', 'Loan Amount', 'Tenure', 'Stage', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.slice(0, 10).map(app => {
                const sc = statusConfig[app.status] || statusConfig.DRAFT;
                const priority = getPriorityLabel(app);
                return (
                  <tr key={app._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{app.applicationNumber?.slice(-6)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-black shrink-0">
                          {(app.kyc?.fullName || app.userId?.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block leading-tight">
                            {app.kyc?.fullName || app.userId?.name || 'Customer'}
                          </span>
                          <span className="text-[11px] text-slate-400">{app.userId?.email || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-800">
                      {app.loanDetails?.amount ? formatCurrency(app.loanDetails.amount) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {app.loanDetails?.tenure ? `${app.loanDetails.tenure} mo` : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md max-w-[140px] truncate">
                        {app.currentStage}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      {priority && (
                        <span className={`block mt-1 text-[10px] font-bold border px-2 py-0.5 rounded ${priority.cls}`}>{priority.label}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDate(app.submittedAt || app.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/admin/applications/${app._id}`)}
                        className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm"
                      >
                        Review <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">No applications yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {applications.slice(0, 8).map(app => {
            const sc = statusConfig[app.status] || statusConfig.DRAFT;
            return (
              <div key={app._id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">#{app.applicationNumber?.slice(-6)}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sc.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{app.kyc?.fullName || app.userId?.name || 'Customer'}</p>
                  <p className="text-xs text-slate-400">{app.userId?.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                  <div><span className="text-slate-400 block text-[10px]">Amount</span><span className="font-bold text-slate-800">{app.loanDetails?.amount ? formatCurrency(app.loanDetails.amount) : '—'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Tenure</span><span className="font-bold text-slate-800">{app.loanDetails?.tenure ? `${app.loanDetails.tenure} mo` : '—'}</span></div>
                </div>
                <button
                  onClick={() => navigate(`/admin/applications/${app._id}`)}
                  className="w-full py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  Review Application <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          {applications.length === 0 && (
            <div className="p-10 text-center"><p className="text-sm text-slate-400">No applications yet.</p></div>
          )}
        </div>

        {/* Footer */}
        {applications.length > 10 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs text-slate-400">Showing 10 of {applications.length}</span>
            <Link to="/admin/applications" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
