import React from 'react';
import { ShieldCheck, Zap, Eye, CheckCircle2 } from 'lucide-react';

const AboutCompanyBanner = () => {
  return (
    <div id="about-ezfinanz-banner" className="pt-8 pb-4 border-t border-slate-200/80 space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">
          About EZFINANZ
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-4xl leading-relaxed">
          EZFINANZ is a modern digital lending platform dedicated to providing quick, reliable, and transparent personal credit solutions across India. We believe financial access should be effortless, which is why our entire process—from instant KYC verification to automated loan disbursal—is 100% digital with zero physical paperwork or branch visits. Whether you need funds for urgent medical care, home improvements, educational upskilling, or consolidating existing obligations, our underwriting engine delivers personalized loan terms with fair rates and upfront fee disclosures. With bank-grade data encryption and dedicated customer support, EZFINANZ ensures a smooth, secure, and empowering borrowing experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span><strong>100% Digital</strong> — Apply and complete KYC online in minutes</span>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <Eye className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span><strong>Zero Hidden Fees</strong> — Full upfront disclosure of EMI and charges</span>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span><strong>Direct Disbursal</strong> — Funds credited directly to your bank account</span>
        </div>

        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span><strong>Secure & Encrypted</strong> — Bank-grade protection for your data</span>
        </div>
      </div>
    </div>
  );
};

export default AboutCompanyBanner;
