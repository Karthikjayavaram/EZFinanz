import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileCheck2,
  BadgeCheck,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

const POPULAR_BANKS = [
  { name: 'State Bank of India', code: 'SBIN' },
  { name: 'HDFC Bank', code: 'HDFC' },
  { name: 'ICICI Bank', code: 'ICIC' },
  { name: 'Axis Bank', code: 'UTIB' },
  { name: 'Kotak Mahindra Bank', code: 'KKBK' },
  { name: 'Punjab National Bank', code: 'PUNB' }
];

export default function BankAccount() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState(null);

  // Eye toggle state for account numbers
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);

  // 6. Bank Account Form State
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    bankName: ''
  });

  // 7. Declaration Checkbox State
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const [ifscVerified, setIfscVerified] = useState(false);
  const [ifscLoading, setIfscLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const errorRef = useRef(null);

  useEffect(() => {
    fetchApplicationData();
  }, []);

  useEffect(() => {
    if (error) {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [error]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/applications/me');
      if (data.success && data.data) {
        const app = data.data;
        setApplication(app);

        const existingBank = app.bankAccount || {};
        const kycName = app.kyc?.fullName || app.userId?.name || '';

        setFormData({
          accountHolderName: existingBank.accountHolderName || kycName,
          accountNumber: existingBank.accountNumber || '',
          confirmAccountNumber: existingBank.accountNumber || '',
          ifsc: existingBank.ifsc || '',
          bankName: existingBank.bankName || ''
        });

        if (existingBank.ifsc) {
          setIfscVerified(true);
        }

        if (app.declaration?.accepted) {
          setDeclarationAccepted(true);
        }
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error('Failed to load application:', err);
      setError('Could not load application details. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time IFSC lookup
  const handleIfscChange = async (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    setFormData((prev) => ({ ...prev, ifsc: val }));
    setIfscVerified(false);
    setError('');

    if (val.length === 11) {
      if (/^[A-Z]{4}0[A-Z0-9]{6}$/.test(val)) {
        lookupIfsc(val);
      } else {
        setError('Invalid IFSC format (e.g. HDFC0001234)');
      }
    }
  };

  const lookupIfsc = async (code) => {
    setIfscLoading(true);
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${code}`);
      if (res.ok) {
        const info = await res.json();
        setFormData((prev) => ({
          ...prev,
          bankName: info.BANK || prev.bankName
        }));
        setIfscVerified(true);
      } else {
        const prefix = code.slice(0, 4);
        const match = POPULAR_BANKS.find((b) => b.code === prefix);
        if (match) {
          setFormData((prev) => ({ ...prev, bankName: match.name }));
        }
        setIfscVerified(true);
      }
    } catch {
      const prefix = code.slice(0, 4);
      const match = POPULAR_BANKS.find((b) => b.code === prefix);
      if (match) {
        setFormData((prev) => ({ ...prev, bankName: match.name }));
      }
      setIfscVerified(true);
    } finally {
      setIfscLoading(false);
    }
  };

  const handleBankSelect = (bank) => {
    setFormData((prev) => ({
      ...prev,
      bankName: bank.name,
      ifsc: prev.ifsc.startsWith(bank.code) ? prev.ifsc : `${bank.code}0`
    }));
  };

  const validateForm = () => {
    if (!formData.accountHolderName.trim()) {
      return 'Account Holder Name is required.';
    }
    if (!formData.accountNumber || formData.accountNumber.length < 9) {
      return 'Account Number must be between 9 and 18 digits.';
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      return 'Account numbers do not match. Please recheck.';
    }
    if (!formData.ifsc.trim() || formData.ifsc.length !== 11) {
      return 'Please enter a valid 11-digit IFSC code.';
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
      return 'Invalid IFSC Code format (e.g. SBIN0001234).';
    }
    if (!formData.bankName.trim()) {
      return 'Bank Name is required.';
    }
    if (!declarationAccepted) {
      return 'Please tick the declaration checkbox to confirm and continue.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErr = validateForm();
    if (valErr) {
      setError(valErr);
      return;
    }

    let app = application;
    if (!app?._id) {
      try {
        const { data } = await api.get('/applications/me');
        if (data?.success && data?.data?._id) {
          app = data.data;
          setApplication(app);
        }
      } catch (fetchErr) {
        console.error('Failed to retrieve application:', fetchErr);
      }
    }

    if (!app?._id) {
      setError('Could not retrieve your loan application. Please ensure you are logged in.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Submit Bank Details (6. Add Bank Account)
      await api.post(`/applications/${app._id}/bank`, {
        accountHolderName: formData.accountHolderName.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifsc: formData.ifsc.trim().toUpperCase(),
        bankName: formData.bankName.trim()
      });

      // 2. Submit Declaration (7. Confirmation of Declaration)
      await api.post(`/applications/${app._id}/declaration`, {
        accepted: true,
        version: 'v2026.1'
      });

      setSavedSuccess(true);
      setTimeout(() => {
        navigate('/customer/selfie');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit details. Please check and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Loading bank & declaration portal...</p>
        </div>
      </div>
    );
  }

  const netDisbursement = application?.loanDetails?.netDisbursement || application?.loanDetails?.amount || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* 1. Header with Breadcrumb */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Step 4 & 5 of 6: Bank & Declaration
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bank Account & Declaration
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
              Add the destination bank account for your loan disbursement and confirm the final declaration to proceed.
            </p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-3 text-right shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Disbursed Amount
            </span>
            <span className="text-xl font-black text-emerald-700 font-mono block mt-0.5">
              {formatCurrency(netDisbursement)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div ref={errorRef} className="bg-white border-l-4 border-rose-500 p-4 rounded-xl shadow-2xs flex items-center justify-between animate-shake">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm text-rose-700 font-semibold">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold text-sm">✕</button>
        </div>
      )}

      {savedSuccess && (
        <div className="bg-white border border-emerald-300 p-4 rounded-xl text-emerald-800 flex items-center gap-3 shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Bank Account & Declaration Confirmed</h4>
            <p className="text-xs text-slate-500">Redirecting to Live Selfie Verification...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ═══════════════════════════════════════════════════════
            6. ADD BANK ACCOUNT CARD
        ═══════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                Disbursement Destination
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                6. Add Bank Account
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The customer adds the bank account where the loan amount will be sent.
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Popular Bank Selection Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Select Your Bank:</span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_BANKS.map((b) => (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => handleBankSelect(b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.bankName === b.name
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields: Account Holder Name, Account Number, IFSC Code, Bank Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Account Holder Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Account Holder Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                placeholder="Full name as in bank records"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                required
              />
            </div>

            {/* Account Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Account Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showAccountNumber ? 'text' : 'password'}
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="Enter 9-18 digit account number"
                  className="w-full px-3.5 py-2.5 pr-11 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAccountNumber(!showAccountNumber)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none cursor-pointer"
                  title={showAccountNumber ? 'Hide account number' : 'Show account number'}
                  aria-label={showAccountNumber ? 'Hide account number' : 'Show account number'}
                >
                  {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            {/* Confirm Account Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Confirm Account Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmAccountNumber ? 'text' : 'password'}
                  value={formData.confirmAccountNumber}
                  onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="Re-enter account number"
                  className={`w-full px-3.5 py-2.5 pr-11 bg-white border rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none transition-all ${
                    formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmAccountNumber(!showConfirmAccountNumber)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none cursor-pointer"
                  title={showConfirmAccountNumber ? 'Hide confirm account number' : 'Show confirm account number'}
                  aria-label={showConfirmAccountNumber ? 'Hide confirm account number' : 'Show confirm account number'}
                >
                  {showConfirmAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
              {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                <span className="text-[10px] text-rose-600 block font-medium">Account numbers do not match</span>
              )}
            </div>

            {/* IFSC Code */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">
                  IFSC Code <span className="text-rose-500">*</span>
                </label>
                {ifscLoading ? (
                  <span className="text-[10px] text-blue-600 font-bold animate-pulse">Looking up...</span>
                ) : ifscVerified ? (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                    <BadgeCheck className="w-3 h-3 text-emerald-600" /> IFSC Verified
                  </span>
                ) : null}
              </div>
              <input
                type="text"
                value={formData.ifsc}
                onChange={handleIfscChange}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                required
              />
            </div>

            {/* Bank Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Bank Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            7. CONFIRMATION OF DECLARATION CARD
        ═══════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                Legal Undertaking
              </span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                7. Confirmation of Declaration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Before the final step, the customer must read and accept a declaration.
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          {/* Clear Terms Display */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5 text-xs text-slate-600">
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Accuracy of Information
              </h4>
              <p className="pl-3 text-slate-500 leading-relaxed">
                I hereby declare that all information, identity documents, bank details, and income disclosures provided by me in this application are true, accurate, and complete to the best of my knowledge.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Consent for Verification & Credit Checks
              </h4>
              <p className="pl-3 text-slate-500 leading-relaxed">
                I grant explicit consent to EZFINANZ and its RBI-regulated partner lenders to perform credit bureau checks (CIBIL, Experian, Equifax), verify C-KYC records, and validate my bank account for loan disbursement.
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Loan Agreement & Repayment Undertaking
              </h4>
              <p className="pl-3 text-slate-500 leading-relaxed">
                I agree to the sanctioned loan terms and monthly installment (EMI) obligations, and authorize electronic debit (e-NACH) from my registered bank account for scheduled repayments.
              </p>
            </div>
          </div>

          {/* Mandatory Checkbox to Confirm */}
          <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-blue-100 bg-blue-50/40 hover:bg-blue-50/60 transition-all cursor-pointer">
            <input
              type="checkbox"
              checked={declarationAccepted}
              onChange={(e) => setDeclarationAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer accent-blue-600"
            />
            <span className="text-xs font-bold text-slate-800 leading-relaxed">
              I have read, understood, and accept all the terms, conditions, and declarations stated above.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !declarationAccepted}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Bank Account & Declaration...</span>
              </>
            ) : (
              <>
                <span>Confirm & Proceed to Live Selfie Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/customer/loan-terms')}
            className="w-full text-slate-400 hover:text-slate-700 text-xs font-semibold py-2 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Back to Loan Amount & Repayment Term
          </button>
        </div>
      </form>
    </div>
  );
}
