import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  FileText,
  BadgeCheck,
  User,
  CreditCard
} from 'lucide-react';

const SanctionLetterModal = ({ isOpen, onClose, application, user }) => {
  if (!isOpen) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const sanctionDate = application?.adminReview?.reviewedAt
    ? new Date(application.adminReview.reviewedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

  const sanctionNumber =
    application?.sanctionReference ||
    `EZF-SNC-${application?.applicationNumber || application?._id?.slice(-8).toUpperCase() || '2026'}`;

  const amount = application?.loanDetails?.amount || application?.eligibility?.calculatedEligibility?.approvedAmount || 300000;
  const tenure = application?.loanDetails?.tenure || 24;
  const rate = application?.loanDetails?.interestRate || 12.5;
  const emi = application?.loanDetails?.emi || Math.round(amount / tenure + (amount * (rate / 100)) / 12);
  const processingFee = application?.loanDetails?.processingFee || Math.round(amount * 0.02);
  const netDisbursed = application?.loanDetails?.netDisbursement || (amount - processingFee);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative my-auto">
        {/* Modal Top Actions Bar */}
        <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between z-20 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
              EZ
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Official Loan Sanction Letter</h3>
              <p className="text-[11px] text-slate-400 font-mono">Ref: {sanctionNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
              title="Print Sanction Letter"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-800 font-sans print:p-0 print:space-y-4" id="sanction-letter-print">
          {/* Header with Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-black flex items-center justify-center text-sm">
                  EZ
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900">EZFINANZ CAPITAL</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-sm">
                EZFinanz Credit Technologies Private Limited<br />
                Licensed Digital NBFC Lending Partner • RBI Regulated<br />
                CIN: U65929KA2024PTC123456 • support@ezfinanz.com
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                SANCTION APPROVED
              </span>
              <p className="text-xs text-slate-600 font-semibold">Date: {sanctionDate}</p>
              <p className="text-xs text-slate-600 font-mono font-bold">Sanction Ref: {sanctionNumber}</p>
            </div>
          </div>

          {/* Salutation & Subject */}
          <div className="space-y-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Borrower,</p>
              <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{application?.kyc?.fullName || user?.name || 'Valued Customer'}</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                PAN / ID: <span className="font-mono font-semibold">{application?.kyc?.idNumber || 'XXXXX0000X'}</span> | Phone: {user?.phone || 'Registered Mobile'} | Email: {user?.email || 'Registered Email'}
              </p>
              {application?.kyc?.address && (
                <p className="text-xs text-slate-500 mt-1">Address: {application.kyc.address}</p>
              )}
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-slate-900">
                Subject: Sanction of Digital Personal Credit Facility under Ref #{sanctionNumber}
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Dear <strong>{application?.kyc?.fullName || user?.name || 'Customer'}</strong>, we are pleased to inform you that based on your credit appraisal, digital KYC verification, and underwriting checks, EZFINANZ has sanctioned your personal loan facility on the terms outlined below:
              </p>
            </div>
          </div>

          {/* Sanction Terms Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="bg-slate-900 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between">
              <span>KEY SANCTION TERMS & CONDITIONS</span>
              <span className="text-emerald-400 font-mono">100% Digital Execution</span>
            </div>
            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-100 bg-white">
                  <td className="p-3.5 font-bold text-slate-500 w-1/2">Sanctioned Loan Amount</td>
                  <td className="p-3.5 font-black text-slate-900 text-sm font-mono">{formatCurrency(amount)}</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="p-3.5 font-bold text-slate-500">Repayment Tenure</td>
                  <td className="p-3.5 font-bold text-slate-800">{tenure} Equated Monthly Installments</td>
                </tr>
                <tr className="border-b border-slate-100 bg-white">
                  <td className="p-3.5 font-bold text-slate-500">Rate of Interest</td>
                  <td className="p-3.5 font-bold text-slate-800">{rate}% p.a. (Reducing Balance Method)</td>
                </tr>
                <tr className="border-b border-slate-100 bg-blue-50/40">
                  <td className="p-3.5 font-bold text-blue-900">Monthly EMI Payable</td>
                  <td className="p-3.5 font-black text-blue-700 text-sm font-mono">{formatCurrency(emi)} / month</td>
                </tr>
                <tr className="border-b border-slate-100 bg-white">
                  <td className="p-3.5 font-bold text-slate-500">Processing Fee (incl. 18% GST)</td>
                  <td className="p-3.5 font-semibold text-slate-700 font-mono">{formatCurrency(processingFee)}</td>
                </tr>
                <tr className="border-b border-slate-100 bg-emerald-50/40">
                  <td className="p-3.5 font-bold text-emerald-900">Net Disbursable Amount</td>
                  <td className="p-3.5 font-black text-emerald-700 text-sm font-mono">{formatCurrency(netDisbursed)}</td>
                </tr>
                <tr className="bg-white">
                  <td className="p-3.5 font-bold text-slate-500">Disbursement Mode</td>
                  <td className="p-3.5 font-semibold text-slate-700">Direct Bank NEFT / IMPS Transfer</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Designated Bank Account */}
          {application?.bankAccount && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Designated Disbursement Bank Account
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Bank Name</span>
                  <span className="font-bold text-slate-800">{application.bankAccount.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Account Number</span>
                  <span className="font-mono font-bold text-slate-800">
                    •••• •••• {application.bankAccount.accountNumber?.slice(-4)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-800">{application.bankAccount.ifscCode}</span>
                </div>
              </div>
            </div>
          )}

          {/* Digital Sign-off & Verification Seal */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Digitally Verified &amp; Underwritten</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Authorized Underwriting Officer • Digital Sanction ID: {sanctionNumber}
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="inline-block border-2 border-dashed border-blue-600/40 bg-blue-50/50 p-2.5 rounded-xl">
                <span className="font-bold text-blue-800 block text-[11px]">EZFINANZ SANCTION SEAL</span>
                <span className="text-[10px] text-blue-600 font-mono block">Digitally Signed on {sanctionDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-3xl border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Sanction Letter
          </button>
        </div>
      </div>
    </div>
  );
};

export default SanctionLetterModal;
