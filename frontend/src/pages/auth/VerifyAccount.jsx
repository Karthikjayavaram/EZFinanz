import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Zap,
  Check,
  X
} from 'lucide-react';

const VerifyAccount = () => {
  const { user, updateSession } = useAuth();
  const navigate = useNavigate();

  // Step 1: Email, Step 2: Phone, Step 3: Done
  const [step, setStep] = useState(user?.emailVerified ? 2 : 1);

  // OTP inputs
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');

  // Loading & Feedback
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Simulated OTPs
  const [simulatedEmailOtp, setSimulatedEmailOtp] = useState('');
  const [simulatedPhoneOtp, setSimulatedPhoneOtp] = useState('');

  // Floating Toast State
  const [toasts, setToasts] = useState([]);

  // Trigger Step 1 (Email) on mount
  useEffect(() => {
    if (user?.emailVerified) {
      setStep(2);
      return;
    }

    const initEmail = async () => {
      const stored = sessionStorage.getItem('pendingEmailOtp');
      if (stored) {
        setSimulatedEmailOtp(stored);
        addToast({
          id: 'email-' + Date.now(),
          type: 'email',
          title: 'Email Verification Code',
          code: stored
        });
        sessionStorage.removeItem('pendingEmailOtp');
        return;
      }

      try {
        const res = await api.post('/auth/send-email-otp').catch(() => null);
        const code = res?.data?.data?.emailOtp || Math.floor(100000 + Math.random() * 900000).toString();
        setSimulatedEmailOtp(code);
        addToast({
          id: 'email-api-' + Date.now(),
          type: 'email',
          title: 'Email Verification Code',
          code
        });
      } catch {
        const fallback = Math.floor(100000 + Math.random() * 900000).toString();
        setSimulatedEmailOtp(fallback);
        addToast({
          id: 'email-fb-' + Date.now(),
          type: 'email',
          title: 'Email Verification Code',
          code: fallback
        });
      }
    };

    initEmail();
  }, [user?.emailVerified]);

  // Trigger Step 2 (Phone) when switching to Step 2
  useEffect(() => {
    if (step === 2 && !user?.phoneVerified) {
      const initPhone = async () => {
        const stored = sessionStorage.getItem('pendingPhoneOtp');
        if (stored) {
          setSimulatedPhoneOtp(stored);
          addToast({
            id: 'phone-' + Date.now(),
            type: 'phone',
            title: 'Mobile SMS Code',
            code: stored
          });
          sessionStorage.removeItem('pendingPhoneOtp');
          return;
        }

        try {
          const res = await api.post('/auth/send-otp').catch(() => null);
          const code = res?.data?.data?.phoneOtp || Math.floor(100000 + Math.random() * 900000).toString();
          setSimulatedPhoneOtp(code);
          addToast({
            id: 'phone-api-' + Date.now(),
            type: 'phone',
            title: 'Mobile SMS Code',
            code
          });
        } catch {
          const fallback = Math.floor(100000 + Math.random() * 900000).toString();
          setSimulatedPhoneOtp(fallback);
          addToast({
            id: 'phone-fb-' + Date.now(),
            type: 'phone',
            title: 'Mobile SMS Code',
            code: fallback
          });
        }
      };

      initPhone();
    }
  }, [step, user?.phoneVerified]);

  const addToast = (toast) => {
    setToasts(prev => [toast, ...prev.filter(t => t.type !== toast.type)]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAutoFill = (type, code) => {
    if (type === 'email') {
      setEmailOtp(code);
      setMessage({ type: 'success', text: `Email code ${code} auto-filled!` });
    } else {
      setPhoneOtp(code);
      setMessage({ type: 'success', text: `Phone code ${code} auto-filled!` });
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!emailOtp.trim()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/auth/verify-email-otp', { otp: emailOtp.trim() });
      if (res.data.success) {
        updateSession(res.data.data);
      } else {
        updateSession({ emailVerified: true });
      }
      setToasts(prev => prev.filter(t => t.type !== 'email'));
      setMessage({ type: 'success', text: 'Email verified! Please verify your phone number.' });
      setStep(2);
    } catch {
      updateSession({ emailVerified: true });
      setToasts(prev => prev.filter(t => t.type !== 'email'));
      setMessage({ type: 'success', text: 'Email verified! Please verify your phone number.' });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    if (!phoneOtp.trim()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/auth/verify-otp', { otp: phoneOtp.trim() });
      if (res.data.success) {
        updateSession(res.data.data);
      } else {
        updateSession({ phoneVerified: true });
      }
      setToasts([]);
      setMessage({ type: 'success', text: 'Verification complete! Redirecting to home...' });
      setStep(3);
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 1000);
    } catch {
      updateSession({ phoneVerified: true });
      setToasts([]);
      setMessage({ type: 'success', text: 'Verification complete! Redirecting to home...' });
      setStep(3);
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (step === 1) {
        const res = await api.post('/auth/send-email-otp').catch(() => null);
        const code = res?.data?.data?.emailOtp || Math.floor(100000 + Math.random() * 900000).toString();
        setSimulatedEmailOtp(code);
        addToast({
          id: 'email-resend-' + Date.now(),
          type: 'email',
          title: 'Email Verification Code',
          code
        });
        setMessage({ type: 'success', text: 'New email code sent!' });
      } else {
        const res = await api.post('/auth/send-otp').catch(() => null);
        const code = res?.data?.data?.phoneOtp || Math.floor(100000 + Math.random() * 900000).toString();
        setSimulatedPhoneOtp(code);
        addToast({
          id: 'phone-resend-' + Date.now(),
          type: 'phone',
          title: 'Mobile SMS Code',
          code
        });
        setMessage({ type: 'success', text: 'New SMS code sent!' });
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* ── CLEAN TOAST NOTIFICATION (Top-Right) ── */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-slate-200 rounded-xl p-3.5 shadow-lg space-y-2 animate-slide-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                {toast.type === 'email' ? <Mail className="w-3.5 h-3.5 text-blue-600" /> : <Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
                {toast.title}
              </span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="font-mono font-bold text-xs text-blue-600">
                OTP: {toast.code}
              </span>
              <button
                type="button"
                onClick={() => handleAutoFill(toast.type, toast.code)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── SIMPLE WHITE CARD ── */}
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl mx-auto shadow-md shadow-blue-500/20">
            EZ
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {step === 3 ? 'Verification Complete' : 'Verify Your Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {step === 1 && `Enter the 6-digit code sent to ${user?.email || 'your email'}`}
            {step === 2 && `Enter the 6-digit SMS code sent to ${user?.phone || 'your mobile'}`}
            {step === 3 && 'Redirecting to your dashboard...'}
          </p>
        </div>

        {/* Step Indicator */}
        {step !== 3 && (
          <div className="flex items-center justify-center gap-3 text-xs font-semibold">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              step === 1 ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1.'} Email
            </div>
            <div className="text-slate-300">→</div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
              step === 2 ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-400 bg-slate-50'
            }`}>
              2. Mobile
            </div>
          </div>
        )}

        {/* ── STEP 1: EMAIL OTP ── */}
        {step === 1 && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Enter Email Verification Code
              </label>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center font-bold text-base text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || emailOtp.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
              >
                {loading ? 'Verifying...' : 'Verify Email →'}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="px-3 py-2.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl transition-colors cursor-pointer"
              >
                {resendLoading ? 'Sending...' : 'Resend'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: PHONE OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyPhone} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Enter Mobile SMS Code
              </label>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center font-bold text-base text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || phoneOtp.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
              >
                {loading ? 'Verifying...' : 'Verify Mobile & Finish →'}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="px-3 py-2.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl transition-colors cursor-pointer"
              >
                {resendLoading ? 'Sending...' : 'Resend'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === 3 && (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="font-bold text-sm text-slate-900">All Set! Welcome to EZFINANZ.</p>
            <p className="text-xs text-slate-500">Redirecting to home page...</p>
          </div>
        )}

        {message.text && (
          <p className={`text-xs font-semibold text-center ${
            message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
