import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  User,
  Building2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Edit3,
  PlusCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  FileText,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState(null);
  const [loanHistory, setLoanHistory] = useState([]);
  const [showEditBankModal, setShowEditBankModal] = useState(false);
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [startingNewLoan, setStartingNewLoan] = useState(false);

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    bankName: '',
    accountType: 'SAVINGS',
    branchName: ''
  });
  const [showAccountDigits, setShowAccountDigits] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSuccess, setBankSuccess] = useState('');
  const [bankError, setBankError] = useState('');

  // Selected new loan category
  const [selectedLoanCategory, setSelectedLoanCategory] = useState('Personal Loan');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [appRes, histRes] = await Promise.all([
        api.get('/applications/me').catch(() => ({ data: { data: null } })),
        api.get('/applications/history').catch(() => ({ data: { data: [] } }))
      ]);

      const current = appRes.data?.data;
      const history = histRes.data?.data || [];

      setActiveApp(current);
      setLoanHistory(history);

      // Populate bank details from active or past application if exists
      const bankSource = current?.bankAccount || history.find(h => h.bankAccount)?.bankAccount;
      if (bankSource) {
        setBankForm({
          accountHolderName: bankSource.accountHolderName || user?.name || '',
          accountNumber: bankSource.accountNumber || '',
          confirmAccountNumber: bankSource.accountNumber || '',
          ifsc: bankSource.ifsc || '',
          bankName: bankSource.bankName || '',
          accountType: bankSource.accountType || 'SAVINGS',
          branchName: bankSource.branchName || ''
        });
      } else {
        setBankForm(prev => ({
          ...prev,
          accountHolderName: user?.name || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const handleBankChange = (e) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
    setBankError('');
  };

  const handleBankSave = async (e) => {
    e.preventDefault();
    setBankError('');
    setBankSuccess('');

    if (!bankForm.accountHolderName.trim() || !bankForm.accountNumber.trim() || !bankForm.ifsc.trim() || !bankForm.bankName.trim()) {
      setBankError('Please fill all mandatory bank account fields.');
      return;
    }

    if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      setBankError('Account numbers do not match. Please re-enter.');
      return;
    }

    const cleanIfsc = bankForm.ifsc.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      setBankError('Invalid IFSC code format (e.g. HDFC0001234).');
      return;
    }

    if (!/^\d{9,18}$/.test(bankForm.accountNumber.trim())) {
      setBankError('Account number must be between 9 and 18 digits.');
      return;
    }

    try {
      setBankSaving(true);
      const res = await api.put('/applications/bank-account', {
        ...bankForm,
        ifsc: cleanIfsc
      });

      if (res.data.success) {
        setBankSuccess('Bank account details updated successfully across your portfolio.');
        setTimeout(() => {
          setShowEditBankModal(false);
          setBankSuccess('');
          fetchProfileData();
        }, 1200);
      }
    } catch (err) {
      setBankError(err.response?.data?.message || 'Failed to update bank details.');
    } finally {
      setBankSaving(false);
    }
  };

  const handleStartNewLoan = async () => {
    try {
      setStartingNewLoan(true);
      const { data } = await api.post('/applications/new', {
        loanType: selectedLoanCategory
      });
      if (data.success && data.data) {
        setShowNewLoanModal(false);
        navigate('/customer/kyc');
      }
    } catch (err) {
      console.error('Failed to create new application:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      }
      navigate('/customer/kyc');
    } finally {
      setStartingNewLoan(false);
    }
  };

  const maskAccountNumber = (acc) => {
    if (!acc) return '—';
    if (showAccountDigits) return acc;
    if (acc.length <= 4) return acc;
    return '•••• •••• ' + acc.slice(-4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 text-sm font-semibold">Loading your account profile...</p>
        </div>
      </div>
    );
  }

  const linkedBank = activeApp?.bankAccount || loanHistory.find(h => h.bankAccount)?.bankAccount;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Account Profile & Loan Portfolio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile, disbursement bank account, and multi-loan applications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewLoanModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Apply for Another Loan
        </button>
      </div>

      {/* Top 2 Side-by-Side Cards (Profile & Bank Account) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Customer Personal Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">{user?.name || 'Customer Name'}</h2>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Customer Account
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Email Address</span>
                <span className="font-semibold text-slate-800 break-all block">{user?.email || '—'}</span>
                <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Phone Number</span>
                <span className="font-semibold text-slate-800 block">{user?.phone || '+91 ••••• •••••'}</span>
                <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Customer ID: <strong className="text-slate-700 font-mono">EZF-CUST-{user?._id?.slice(-6).toUpperCase()}</strong></span>
            <span>Auth: <strong className="text-slate-700 capitalize">{user?.authProvider || 'Local'}</strong></span>
          </div>
        </div>

        {/* Card 2: Linked Disbursement Bank Account (With Edit Button) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Disbursement Bank Account</h3>
                  <p className="text-xs text-slate-500">Where all approved loan disbursements are credited</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditBankModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Bank
              </button>
            </div>

            {linkedBank ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Name</span>
                  <span className="font-bold text-sm text-slate-900">{linkedBank.bankName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Holder</span>
                  <span className="font-bold text-xs text-slate-800">{linkedBank.accountHolderName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Number</span>
                  <div className="flex items-center gap-2 font-mono font-bold text-xs text-slate-900">
                    <span>{maskAccountNumber(linkedBank.accountNumber)}</span>
                    <button
                      type="button"
                      onClick={() => setShowAccountDigits(!showAccountDigits)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {showAccountDigits ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">IFSC Code</span>
                  <span className="font-mono font-bold text-xs text-indigo-600">{linkedBank.ifsc}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Type</span>
                  <span className="font-bold text-xs text-slate-700">{linkedBank.accountType || 'SAVINGS'}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No Bank Account Linked Yet</p>
                <p className="text-[11px]">Click Edit Bank to add your account for fast loan disbursements.</p>
                <button
                  type="button"
                  onClick={() => setShowEditBankModal(true)}
                  className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl mt-2 cursor-pointer"
                >
                  + Add Bank Details
                </button>
              </div>
            )}
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-900 mt-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Direct electronic IMPS/NEFT transfer enabled for instant sanction credit.</span>
          </div>
        </div>
      </div>

      {/* Multi-Loan Portfolio & History Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              My Loan Portfolio & Applications
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              View all current, disbursed, and past loan applications tied to your account.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Total Applications: {loanHistory.length}
          </span>
        </div>

        {loanHistory.length > 0 ? (
          <div className="space-y-4">
            {loanHistory.map((loan, idx) => {
              const isDisbursed = loan.status === 'DISBURSED' || loan.currentStage === 'DISBURSEMENT_CONFIRMED';
              const isApproved = loan.status === 'APPROVED' || loan.currentStage === 'APPLICATION_APPROVED';
              const isRejected = loan.status === 'REJECTED';
              const isUnderReview = loan.status === 'PENDING' || loan.currentStage === 'WAITING_FOR_ADMIN';

              let statusBadge = {
                text: 'In Progress',
                color: 'bg-blue-50 text-blue-700 border-blue-200',
                icon: <Clock className="w-3.5 h-3.5" />
              };

              if (isDisbursed) {
                statusBadge = {
                  text: 'Disbursed & Active',
                  color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                };
              } else if (isApproved) {
                statusBadge = {
                  text: 'Sanction Approved',
                  color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  icon: <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                };
              } else if (isRejected) {
                statusBadge = {
                  text: 'Not Approved',
                  color: 'bg-rose-50 text-rose-700 border-rose-200',
                  icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                };
              } else if (isUnderReview) {
                statusBadge = {
                  text: 'Under Review',
                  color: 'bg-amber-50 text-amber-800 border-amber-200',
                  icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
                };
              }

              return (
                <div
                  key={loan._id || idx}
                  className="bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg font-bold shadow-2xs">
                        {loan.loanType?.includes('Medical') ? '🏥' : loan.loanType?.includes('Gadget') || loan.loanType?.includes('Consumer') ? '📱' : loan.loanType?.includes('Education') ? '🎓' : loan.loanType?.includes('Home') ? '🏡' : loan.loanType?.includes('Travel') ? '✈️' : loan.loanType?.includes('Vehicle') ? '🛵' : loan.loanType?.includes('Business') ? '💼' : '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {loan.loanType || 'Personal Loan'}
                          </h4>
                          <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            #{loan.applicationNumber}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Applied on {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                        </span>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.color}`}>
                      {statusBadge.icon}
                      {statusBadge.text}
                    </span>
                  </div>

                  {/* Financial Terms Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Loan Amount</span>
                      <span className="font-black text-slate-900 font-mono text-sm">
                        {loan.loanDetails?.amount ? formatCurrency(loan.loanDetails.amount) : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                      <span className="font-bold text-slate-800">
                        {loan.loanDetails?.tenure ? `${loan.loanDetails.tenure} Months` : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly EMI</span>
                      <span className="font-bold text-blue-600 font-mono">
                        {loan.loanDetails?.emi ? formatCurrency(loan.loanDetails.emi) + '/mo' : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Action / State</span>
                      {isDisbursed ? (
                        <span className="text-emerald-600 font-bold text-xs">✓ Active Disbursed</span>
                      ) : isApproved ? (
                        <button
                          onClick={() => navigate('/customer/dashboard')}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs underline cursor-pointer"
                        >
                          View Sanction →
                        </button>
                      ) : isRejected ? (
                        <span className="text-rose-600 font-semibold text-xs">Declined</span>
                      ) : (
                        <button
                          onClick={() => navigate('/customer/dashboard')}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs underline flex items-center gap-1 cursor-pointer"
                        >
                          Continue App <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-slate-700 font-bold text-sm">No Loan Applications Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't initiated any personal loan requests yet. Click below to start your first application.
            </p>
            <button
              onClick={() => setShowNewLoanModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Start Application Now
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL 1: EDIT BANK ACCOUNT DETAILS ── */}
      {showEditBankModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900">Update Disbursement Bank Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditBankModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {bankError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bankError}</span>
              </div>
            )}

            {bankSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{bankSuccess}</span>
              </div>
            )}

            <form onSubmit={handleBankSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={bankForm.accountHolderName}
                  onChange={handleBankChange}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  placeholder="As per bank passbook"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Number *</label>
                  <input
                    type="password"
                    name="accountNumber"
                    value={bankForm.accountNumber}
                    onChange={handleBankChange}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm Account Number *</label>
                  <input
                    type="text"
                    name="confirmAccountNumber"
                    value={bankForm.confirmAccountNumber}
                    onChange={handleBankChange}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                    placeholder="Re-enter account number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    name="ifsc"
                    value={bankForm.ifsc}
                    onChange={handleBankChange}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono text-xs"
                    placeholder="e.g. HDFC0001234"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={bankForm.bankName}
                    onChange={handleBankChange}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                    placeholder="e.g. HDFC Bank"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Type</label>
                  <select
                    name="accountType"
                    value={bankForm.accountType}
                    onChange={handleBankChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Name (Optional)</label>
                  <input
                    type="text"
                    name="branchName"
                    value={bankForm.branchName}
                    onChange={handleBankChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                    placeholder="e.g. Indiranagar Branch"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditBankModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={bankSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  {bankSaving ? 'Saving Updates...' : 'Save Bank Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: START NEW LOAN APPLICATION ── */}
      {showNewLoanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Apply for a New Loan</h3>
                <p className="text-xs text-slate-500">Select the loan purpose to get customized interest rates and terms.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewLoanModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'Personal Loan', name: 'Personal Loan', icon: '👤', desc: 'Instant cash & general' },
                { id: 'Medical Emergency', name: 'Medical Emergency', icon: '🏥', desc: 'Healthcare & treatments' },
                { id: 'Consumer Durables', name: 'Consumer Durables', icon: '📱', desc: 'Laptops, phones & tech' },
                { id: 'Education & Skill', name: 'Education & Skill', icon: '🎓', desc: 'Tuition & skill courses' },
                { id: 'Home Renovation', name: 'Home Renovation', icon: '🏡', desc: 'Repairs & painting' },
                { id: 'Travel & Holiday', name: 'Travel & Holiday', icon: '✈️', desc: 'Domestic & overseas trips' },
                { id: 'Two-Wheeler / Auto', name: 'Two-Wheeler / Auto', icon: '🛵', desc: 'Bikes & maintenance' },
                { id: 'Business Expansion', name: 'Business Expansion', icon: '💼', desc: 'Working capital' }
              ].map((cat) => {
                const selected = selectedLoanCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedLoanCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      selected
                        ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{cat.icon}</div>
                    <div className="font-extrabold text-xs text-slate-900 leading-snug">{cat.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewLoanModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartNewLoan}
                disabled={startingNewLoan}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {startingNewLoan ? 'Initializing...' : 'Proceed with Application →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
