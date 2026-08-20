import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight
} from 'lucide-react';
import DashboardFooter from '../components/dashboard/DashboardFooter';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/customer/dashboard') {
      navigate('/customer/dashboard');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = [
    { label: 'Home', action: () => scrollToSection('my-loan-overview') },
    { label: 'Loan Options', action: () => scrollToSection('loan-options-section') },
    { label: 'My Profile & Loans', action: () => { setMobileMenuOpen(false); navigate('/customer/profile'); } },
    { label: 'About EZFINANZ', action: () => scrollToSection('about-ezfinanz-banner') },
    { label: 'Help / FAQ', action: () => scrollToSection('faq-section') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header with Consistent Frosted Glassmorphism Blur */}
      <header 
        className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 text-slate-900 shadow-xs transition-all"
        style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-600/30">
              EZ
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                EZFINANZ
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                Digital Credit
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  item.label === 'My Profile & Loans' && location.pathname === '/customer/profile'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-900/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => navigate('/customer/profile')}
              className="hidden sm:flex items-center gap-2.5 bg-slate-900/5 hover:bg-blue-50 py-1.5 px-3 rounded-xl border border-slate-900/10 hover:border-blue-200 backdrop-blur-sm cursor-pointer transition-all"
              title="View your account profile and loan portfolio"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                {user?.name || 'Customer'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-bold text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-900/5 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-2xl animate-fade-in text-slate-900">
            <div 
              onClick={() => { setMobileMenuOpen(false); navigate('/customer/profile'); }}
              className="flex items-center gap-2.5 pb-3 mb-2 border-b border-slate-100 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{user?.name}</span>
                <span className="text-[11px] text-slate-500">{user?.email}</span>
              </div>
            </div>

            {navLinks.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between cursor-pointer"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${location.pathname.includes('/dashboard') ? '' : 'max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8'}`}>
        {children}
      </main>

      {/* Full-Width Global Footer */}
      <DashboardFooter />
    </div>
  );
};

export default MainLayout;
