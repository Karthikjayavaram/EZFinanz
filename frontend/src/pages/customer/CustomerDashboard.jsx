import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import FintechHeroSection from '../../components/dashboard/FintechHeroSection';
import MyLoanProgressCard from '../../components/dashboard/MyLoanProgressCard';
import CompactLoanOptions from '../../components/dashboard/CompactLoanOptions';
import AboutCompanyBanner from '../../components/dashboard/AboutCompanyBanner';
import CompactFaqSection from '../../components/dashboard/CompactFaqSection';
import SanctionLetterModal from '../../components/dashboard/SanctionLetterModal';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSanctionModal, setShowSanctionModal] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get('/applications/me');
      setApplication(data.data);
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [starting, setStarting] = useState(false);

  const handleContinue = async (selectedLoanType) => {
    const stage = application?.currentStage;
    const status = application?.status;

    // Disbursed or Approved -> show modal
    if (status === 'APPROVED' || stage === 'APPLICATION_APPROVED' || status === 'DISBURSED' || stage === 'DISBURSEMENT_CONFIRMED') {
      setShowSanctionModal(true);
      return;
    }

    const loanType = typeof selectedLoanType === 'string' && selectedLoanType.trim() 
      ? selectedLoanType.trim() 
      : application?.loanType || 'Personal Loan';

    // Active application in progress -> navigate to corresponding step
    if (application && stage) {
      if (['REGISTERED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED'].includes(stage)) {
        navigate('/customer/kyc', { state: { loanType } });
        return;
      } else if (stage === 'KYC_COMPLETED') {
        navigate('/customer/eligibility');
        return;
      } else if (stage === 'ELIGIBILITY_COMPLETED') {
        navigate('/customer/loan-terms');
        return;
      } else if (stage === 'EMI_SELECTED') {
        navigate('/customer/bank-account');
        return;
      } else if (stage === 'BANK_ACCOUNT_ADDED') {
        navigate('/customer/declaration');
        return;
      } else if (stage === 'DECLARATION_ACCEPTED' || stage === 'SELFIE_REJECTED' || stage === 'WAITING_FOR_ADMIN') {
        navigate('/customer/selfie');
        return;
      }
    }

    // No active application – create a fresh one then start KYC
    try {
      setStarting(true);
      const { data } = await api.post('/applications/new', { loanType });
      if (data.success && data.data) {
        setApplication(data.data);
      }
      navigate('/customer/kyc', { state: { loanType } });
    } catch (err) {
      console.error('Failed to create new application:', err);
      // If user was deleted/unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      // If user already has an application returned in data
      if (err.response?.data?.data) {
        setApplication(err.response.data.data);
      }
      navigate('/customer/kyc', { state: { loanType } });
    } finally {
      setStarting(false);
    }
  };

  const scrollToElement = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="h-80 bg-slate-900/80 animate-pulse w-full border-b border-slate-800" />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse py-8">
          <div className="h-72 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in space-y-8 pb-12">
      {/* 1. FULL-WIDTH DIGITAL CREDIT PLATFORM HERO SECTION */}
      <FintechHeroSection
        userName={user?.name}
        onApply={handleContinue}
        application={application}
        starting={starting}
      />

      {/* Container for remaining dashboard cards & content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 2. MY LOAN / APPLICATION CARD (Real Database State & Tracker) */}
        <MyLoanProgressCard
          application={application}
          onContinue={handleContinue}
          onRefresh={fetchApplication}
          refreshing={refreshing}
          starting={starting}
        />

        {/* 4. EXPLORE ALL LOAN OPTIONS */}
        <CompactLoanOptions
          onApplyClick={handleContinue}
          application={application}
          user={user}
        />

        {/* 5. ABOUT EZFINANZ BANNER */}
        <AboutCompanyBanner />

        {/* 6. ESSENTIAL FAQS ACCORDION */}
        <CompactFaqSection />
      </div>

      {/* 8. OFFICIAL SANCTION LETTER MODAL */}
      <SanctionLetterModal
        isOpen={showSanctionModal}
        onClose={() => setShowSanctionModal(false)}
        application={application}
        user={user}
      />
    </div>
  );
};

export default CustomerDashboard;
