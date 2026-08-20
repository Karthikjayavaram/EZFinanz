import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  RotateCcw,
  ArrowRight,
  Table,
  ChevronDown,
  ChevronUp,
  Info,
  Banknote,
  Percent,
  Receipt,
  Clock,
  Coins
} from 'lucide-react';

const TENURE_PRESETS = [
  { months: 6, label: '6 Months', subtitle: '0.5 Year' },
  { months: 12, label: '12 Months', subtitle: '1 Year', popular: true },
  { months: 18, label: '18 Months', subtitle: '1.5 Years' },
  { months: 24, label: '24 Months', subtitle: '2 Years' },
  { months: 36, label: '36 Months', subtitle: '3 Years' },
  { months: 48, label: '48 Months', subtitle: '4 Years' },
];

export default function LoanSelection() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState(null);

  // Core Form State
  const [amount, setAmount] = useState(200000);
  const [tenure, setTenure] = useState(12);
  const [interestRate, setInterestRate] = useState(12.5);
  const [minAmount] = useState(25000);
  const [maxAmount, setMaxAmount] = useState(1000000);

  // UI state
  const [showAmortization, setShowAmortization] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchApplicationData();
  }, []);

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/applications/me');
      if (data.success && data.data) {
        const app = data.data;
        setApplication(app);

        const elig = app.eligibility || {};
        const existingLoan = app.loanDetails || {};

        const userRate = elig.applicableInterestRate || (elig.creditScore >= 750 ? 10.5 : elig.creditScore >= 700 ? 12.5 : 15.0);
        setInterestRate(userRate);

        const calculatedMax = elig.maxEligibleAmount || (elig.monthlyIncome ? elig.monthlyIncome * 20 : 1000000);
        const effectiveMax = Math.min(2500000, Math.max(100000, calculatedMax));
        setMaxAmount(effectiveMax);

        if (existingLoan.amount) {
          setAmount(existingLoan.amount);
          setTenure(existingLoan.tenure || 12);
        } else if (elig.requestedLoanAmount) {
          const initialAmount = Math.min(elig.requestedLoanAmount, effectiveMax);
          setAmount(initialAmount);
        } else {
          setAmount(Math.min(200000, effectiveMax));
        }
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error('Failed to load application:', err);
      setError('Could not load your loan application. Please refresh or try again.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time complete calculations
  const loanCalculations = useMemo(() => {
    const principal = Number(amount) || minAmount;
    const numTenure = Number(tenure) || 12;
    const rate = Number(interestRate) || 12;

    const monthlyRate = rate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, numTenure);
    const emi = (principal * monthlyRate * factor) / (factor - 1);

    const processingFee = Math.round(principal * 0.02); // 2% processing fee
    const gst = Math.round(processingFee * 0.18); // 18% GST
    const otherCharges = 0; // Other applicable charges
    const totalCharges = processingFee + gst + otherCharges;
    const netDisbursement = principal - totalCharges;

    const totalRepayment = Math.round(emi * numTenure);
    const totalInterest = Math.round(totalRepayment - principal);

    // Approximate IRR calculation
    const cashFlows = [-netDisbursement];
    for (let i = 0; i < numTenure; i++) {
      cashFlows.push(emi);
    }

    let min = 0.0;
    let max = 1.0;
    let guess = 0.1;
    for (let iter = 0; iter < 500; iter++) {
      let npv = 0;
      for (let i = 0; i < cashFlows.length; i++) {
        npv += cashFlows[i] / Math.pow(1 + guess, i);
      }
      if (Math.abs(npv) < 0.0001) break;
      if (npv > 0) {
        min = guess;
        guess = (guess + max) / 2;
      } else {
        max = guess;
        guess = (min + guess) / 2;
      }
    }
    const irr = parseFloat((guess * 12 * 100).toFixed(2));

    // Generate month-by-month schedule
    const schedule = [];
    let balance = principal;
    for (let m = 1; m <= numTenure; m++) {
      const monthInterest = balance * monthlyRate;
      let monthPrincipal = emi - monthInterest;
      if (m === numTenure || balance - monthPrincipal < 0) {
        monthPrincipal = balance;
      }
      const closing = Math.max(0, balance - monthPrincipal);

      schedule.push({
        month: m,
        openingBalance: Math.round(balance),
        emi: Math.round(monthPrincipal + monthInterest),
        principal: Math.round(monthPrincipal),
        interest: Math.round(monthInterest),
        closingBalance: Math.round(closing)
      });
      balance = closing;
    }

    return {
      principal,
      tenure: numTenure,
      interestRate: rate,
      emi: Math.round(emi),
      totalInterest,
      totalRepayment,
      processingFee,
      gst,
      otherCharges,
      totalCharges,
      netDisbursement,
      irr,
      schedule
    };
  }, [amount, tenure, interestRate, minAmount]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getPresetEMI = (presetMonths) => {
    const principal = Number(amount) || minAmount;
    const monthlyRate = interestRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, presetMonths);
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    return Math.round(emi);
  };

  const handleAmountChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = Number(rawVal);
    setAmount(num);
  };

  const handleAmountBlur = () => {
    if (amount < minAmount) setAmount(minAmount);
    if (amount > maxAmount) setAmount(maxAmount);
  };

  const handleProceed = async () => {
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

    if (amount < minAmount || amount > maxAmount) {
      setError(`Loan amount must be between ${formatCurrency(minAmount)} and ${formatCurrency(maxAmount)}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        amount: loanCalculations.principal,
        tenure: loanCalculations.tenure,
        interestRate: loanCalculations.interestRate
      };

      const res = await api.post(`/applications/${app._id}/loan`, payload);
      if (res.data.success) {
        setSavedSuccess(true);
        setTimeout(() => {
          navigate('/customer/bank-account');
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit loan details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">Calculating eligible loan terms...</p>
        </div>
      </div>
    );
  }

  const presetAmounts = [
    50000,
    100000,
    200000,
    500000,
    maxAmount
  ].filter((v, i, a) => a.indexOf(v) === i && v <= maxAmount);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* 1. Header with Breadcrumb & Pre-Approved Limit */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Step 3 of 6: Loan Customization
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Select Your Loan Amount & Repayment Term
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
              Choose your loan amount and tenure. The system calculates and displays complete terms with zero hidden fees.
            </p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-3 text-right shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Pre-Approved Limit
            </span>
            <span className="text-xl font-black text-emerald-700 font-mono block mt-0.5">
              {formatCurrency(maxAmount)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-white border-l-4 border-rose-500 p-4 rounded-xl shadow-2xs flex items-center justify-between">
          <p className="text-sm text-rose-700 font-medium">{error}</p>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold text-sm">✕</button>
        </div>
      )}

      {savedSuccess && (
        <div className="bg-white border border-emerald-300 p-4 rounded-xl text-emerald-800 flex items-center gap-3 shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Loan Terms Confirmed</h4>
            <p className="text-xs text-slate-500">Proceeding to bank account verification...</p>
          </div>
        </div>
      )}

      {/* 2. Top Row: Two Equal Cards Side by Side (50% / 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Loan Amount & Repayment Duration Selectors */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between h-full">
          {/* Section A: Loan Amount Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-extrabold text-slate-900 text-base block">
                  1. Loan Amount Selection
                </label>
                <span className="text-xs text-slate-400">
                  Range: {formatCurrency(minAmount)} – {formatCurrency(maxAmount)}
                </span>
              </div>

              {/* Number Input Box */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                <input
                  type="text"
                  value={amount ? Number(amount).toLocaleString('en-IN') : ''}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  className="w-36 sm:w-44 pl-7 pr-3 py-2 text-right font-mono font-black text-lg text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Amount Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min={minAmount}
                max={maxAmount}
                step={5000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-0.5">
                <span>Min: {formatCurrency(minAmount)}</span>
                <span className="text-slate-700 font-bold">{formatCurrency(amount)}</span>
                <span>Max: {formatCurrency(maxAmount)}</span>
              </div>
            </div>

            {/* Quick Amount Preset Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {presetAmounts.map((preset) => {
                const isSelected = amount === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {formatCurrency(preset)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 my-2" />

          {/* Section B: Repayment Tenure Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-extrabold text-slate-900 text-base block">
                  2. Choose Repayment Tenure
                </label>
                <span className="text-xs text-slate-400">
                  Select your required repayment duration
                </span>
              </div>

              <span className="font-extrabold text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {tenure} Months ({(tenure / 12).toFixed(1).replace('.0', '')} {tenure >= 12 ? 'Years' : 'Year'})
              </span>
            </div>

            {/* Preset Tenure Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TENURE_PRESETS.map((item) => {
                const isSelected = tenure === item.months;
                const previewEmi = getPresetEMI(item.months);

                return (
                  <button
                    key={item.months}
                    type="button"
                    onClick={() => setTenure(item.months)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-white ring-2 ring-blue-100 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-extrabold ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                        {item.label}
                      </span>
                      {isSelected && <span className="text-blue-600 text-xs font-bold">✓</span>}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-baseline justify-between text-xs">
                      <span className="text-[10px] text-slate-400">EMI:</span>
                      <span className={`font-mono font-black ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                        {formatCurrency(previewEmi)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Slider Option */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Custom Duration Slider</span>
                <span>{tenure} Months</span>
              </div>
              <input
                type="range"
                min={3}
                max={48}
                step={1}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>3 Mos</span>
                <span>12 Mos (1 Yr)</span>
                <span>24 Mos (2 Yrs)</span>
                <span>36 Mos (3 Yrs)</span>
                <span>48 Mos (4 Yrs)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Applicable Rates, Fees & Calculation Baseline (Equal 50% width) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-5 flex flex-col justify-between h-full">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
              Calculation Parameters
            </span>
            <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
              Applicable Rates & Fees
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Parameters considered for calculating your final loan terms
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
            <div className="flex justify-between items-center p-3">
              <span className="text-slate-600">Final Loan Amount Considered</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(loanCalculations.principal)}</span>
            </div>

            <div className="flex justify-between items-center p-3">
              <span className="text-slate-600">Applicable Annual Interest Rate</span>
              <span className="font-bold text-slate-900">{loanCalculations.interestRate}% p.a.</span>
            </div>

            <div className="flex justify-between items-center p-3">
              <span className="text-slate-600">Selected Repayment Tenure</span>
              <span className="font-bold text-slate-900">{loanCalculations.tenure} Months</span>
            </div>

            <div className="flex justify-between items-center p-3">
              <span className="text-slate-600">Processing Fee (2%)</span>
              <span className="font-mono font-bold text-slate-800">{formatCurrency(loanCalculations.processingFee)}</span>
            </div>

            <div className="flex justify-between items-center p-3">
              <span className="text-slate-600">GST on Processing Fee (18%)</span>
              <span className="font-mono font-bold text-slate-800">{formatCurrency(loanCalculations.gst)}</span>
            </div>

            <div className="flex justify-between items-center p-3">
              <span className="text-slate-600">Other Applicable Charges</span>
              <span className="font-bold text-emerald-700">₹0 (None)</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50/60">
              <span className="font-bold text-slate-800">Total Upfront Charges / Deductions</span>
              <span className="font-mono font-black text-rose-700">- {formatCurrency(loanCalculations.totalCharges)}</span>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-xs text-slate-600 space-y-1 mt-auto">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Transparent 1-Time Deduction</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Processing fees and GST are deducted once at disbursement. There are zero hidden charges or recurring maintenance costs.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Complete Calculated Loan Terms & Repayment Summary Card (Below Top Cards) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
              Real-Time Results
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Complete Calculated Loan Terms
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculated live based on your selected amount, tenure, interest rate, and applicable charges
            </p>
          </div>

          {/* Prominent Monthly EMI Tag */}
          <div className="bg-white border-2 border-blue-600 rounded-xl px-5 py-2.5 text-right shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              Monthly Installment (EMI)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {formatCurrency(loanCalculations.emi)}
              <span className="text-xs font-normal text-slate-400"> / mo</span>
            </div>
          </div>
        </div>

        {/* Output Metrics Grid in Clean White Sub-Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Net Disbursement
            </span>
            <span className="text-base font-black text-emerald-700 font-mono block">
              {formatCurrency(loanCalculations.netDisbursement)}
            </span>
            <span className="text-[10px] text-emerald-600 block">Credited to Bank</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Interest
            </span>
            <span className="text-base font-black text-amber-700 font-mono block">
              {formatCurrency(loanCalculations.totalInterest)}
            </span>
            <span className="text-[10px] text-slate-400 block">Over {loanCalculations.tenure} Months</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Repayment
            </span>
            <span className="text-base font-black text-blue-900 font-mono block">
              {formatCurrency(loanCalculations.totalRepayment)}
            </span>
            <span className="text-[10px] text-slate-400 block">Principal + Interest</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Charges
            </span>
            <span className="text-base font-black text-rose-700 font-mono block">
              {formatCurrency(loanCalculations.totalCharges)}
            </span>
            <span className="text-[10px] text-slate-400 block">Fee + 18% GST</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Applicable Rate
            </span>
            <span className="text-base font-black text-slate-900 font-mono block">
              {loanCalculations.interestRate}%
            </span>
            <span className="text-[10px] text-slate-400 block">Annual Reducing</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Applicable IRR
            </span>
            <span className="text-base font-black text-slate-900 font-mono block">
              {loanCalculations.irr}%
            </span>
            <span className="text-[10px] text-slate-400 block">Effective Annual</span>
          </div>
        </div>

        {/* Action Controls & Schedule Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAmortization(!showAmortization)}
            className="flex items-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-700 hover:text-blue-700 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Table className="w-3.5 h-3.5 text-blue-600" />
            <span>{showAmortization ? 'Hide Repayment Schedule' : 'View Month-by-Month Amortization Schedule'}</span>
            {showAmortization ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleProceed}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ml-auto"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirming Loan Terms...</span>
              </>
            ) : (
              <>
                <span>Confirm & Proceed to Bank Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Month-by-Month Amortization Table (When Expanded) */}
        {showAmortization && (
          <div className="pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">
                Month-by-Month Principal & Interest Amortization Schedule
              </span>
              <span className="text-slate-500 font-mono">
                {loanCalculations.schedule.length} Months
              </span>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Month</th>
                    <th className="px-4 py-2.5">Opening Balance</th>
                    <th className="px-4 py-2.5">EMI Amount</th>
                    <th className="px-4 py-2.5 text-blue-700">Principal Paid</th>
                    <th className="px-4 py-2.5 text-amber-700">Interest Paid</th>
                    <th className="px-4 py-2.5">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loanCalculations.schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2 font-bold text-slate-900">Month {row.month}</td>
                      <td className="px-4 py-2 font-mono text-slate-600">{formatCurrency(row.openingBalance)}</td>
                      <td className="px-4 py-2 font-mono font-semibold text-slate-900">{formatCurrency(row.emi)}</td>
                      <td className="px-4 py-2 font-mono font-semibold text-blue-600">{formatCurrency(row.principal)}</td>
                      <td className="px-4 py-2 font-mono font-semibold text-amber-600">{formatCurrency(row.interest)}</td>
                      <td className="px-4 py-2 font-mono font-bold text-slate-800">{formatCurrency(row.closingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
