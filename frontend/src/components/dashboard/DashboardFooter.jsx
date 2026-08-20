import React from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Heart
} from 'lucide-react';

const DashboardFooter = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800 mt-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-600/30">
                EZ
              </div>
              <span className="font-black text-lg tracking-tight text-white">
                EZFINANZ
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              EZFINANZ is a digital personal-loan platform designed to provide a simple, secure, and transparent borrowing experience with real-time eligibility evaluation and zero hidden charges.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Bank-Grade 256-Bit Data Security</span>
            </div>
          </div>

          {/* Quick Navigation (1 col) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => scrollTo('loan-products')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Loan Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('eligibility-info')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Loan Eligibility
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('emi-calculator')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  EMI Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Support (1 col) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => scrollTo('about-ezfinanz')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About EZFINANZ
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('faqs')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQs & Support
                </button>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Terms of Service</span>
              </li>
            </ul>
          </div>

          {/* Contact Info (1 col) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>karthik.jayavaram@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>+91 6301015578</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>Plot No. 42, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="border-t border-slate-800 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EZFINANZ Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed for a seamless digital borrowing experience
          </p>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
