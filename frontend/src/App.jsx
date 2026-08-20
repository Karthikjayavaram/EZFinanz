import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuthSuccess from './pages/auth/OAuthSuccess';
import CompleteProfile from './pages/auth/CompleteProfile';
import VerifyAccount from './pages/auth/VerifyAccount';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import KYCForm from './pages/customer/KYCForm';
import Eligibility from './pages/customer/Eligibility';
import LoanSelection from './pages/customer/LoanSelection';
import BankAccount from './pages/customer/BankAccount';
import Declaration from './pages/customer/Declaration';
import SelfieVerification from './pages/customer/SelfieVerification';
import Profile from './pages/customer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationDetail from './pages/admin/AdminApplicationDetail';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Helper to get correct landing route based on user verification and role
const getAuthenticatedRedirect = (user) => {
  if (!user) return '/login';
  if (!user.phone) return '/complete-profile';
  if (!user.emailVerified || !user.phoneVerified) return '/verify';
  return user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard';
};

// Role-Protected Route Guard
const ProtectedRoute = ({ children, allowedRole, requireVerification = true }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Unauthenticated users cannot access any protected page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Unverified users must complete verification before accessing dashboard
  if (requireVerification) {
    if (!user.phone) {
      return <Navigate to="/complete-profile" replace />;
    }
    if (!user.emailVerified || !user.phoneVerified) {
      return <Navigate to="/verify" replace />;
    }
  }

  // 3. Role-based check
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={getAuthenticatedRedirect(user)} replace />;
  }

  return children;
};

// Public Route Guard (Redirects authenticated users to their respective dashboards)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getAuthenticatedRedirect(user)} replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <Navigate to={getAuthenticatedRedirect(user)} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      
      {/* Profile & Verification Routes */}
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/verify" element={
        <ProtectedRoute allowedRole={null} requireVerification={false}>
          <VerifyAccount />
        </ProtectedRoute>
      } />

      {/* Customer Routes (Protected: Role == CUSTOMER) */}
      <Route path="/customer/*" element={
        <ProtectedRoute allowedRole="CUSTOMER">
          <MainLayout>
             <Routes>
               <Route path="" element={<Navigate to="dashboard" replace />} />
               <Route path="dashboard" element={<CustomerDashboard />} />
               <Route path="kyc" element={<KYCForm />} />
               <Route path="eligibility" element={<Eligibility />} />
               <Route path="loan-terms" element={<LoanSelection />} />
               <Route path="loan-preview" element={<LoanSelection />} />
               <Route path="emi-selection" element={<LoanSelection />} />
               <Route path="bank-account" element={<BankAccount />} />
               <Route path="bank" element={<BankAccount />} />
               <Route path="add-bank" element={<BankAccount />} />
               <Route path="declaration" element={<Declaration />} />
               <Route path="selfie" element={<SelfieVerification />} />
               <Route path="photo-verification" element={<SelfieVerification />} />
               <Route path="profile" element={<Profile />} />
               <Route path="*" element={<Navigate to="dashboard" replace />} />
             </Routes>
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes (Protected: Role == ADMIN) */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRole="ADMIN">
          <AdminLayout>
             <Routes>
               <Route path="" element={<Navigate to="dashboard" replace />} />
               <Route path="dashboard" element={<AdminDashboard />} />
               <Route path="applications" element={<AdminApplications />} />
               <Route path="applications/:id" element={<AdminApplicationDetail />} />
               <Route path="*" element={<Navigate to="dashboard" replace />} />
             </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
