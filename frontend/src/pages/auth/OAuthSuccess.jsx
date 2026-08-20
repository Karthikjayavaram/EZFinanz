import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleToken = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');

      if (!token) {
        navigate('/login?error=Invalid authentication response', { replace: true });
        return;
      }

      const res = await loginWithToken(token);
      if (res.success) {
        // Check if phone number is missing
        if (!res.data.phone) {
          navigate('/complete-profile', { replace: true });
        } else {
          // If phone number exists, proceed to dashboard
          if (res.data.role === 'ADMIN') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/customer/dashboard', { replace: true });
          }
        }
      } else {
        setError(res.message);
        setTimeout(() => {
          navigate('/login?error=' + encodeURIComponent(res.message), { replace: true });
        }, 2000);
      }
    };

    handleToken();
  }, [location, loginWithToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        {error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 font-medium">Completing authentication...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthSuccess;
