import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Eligibility = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationId, setApplicationId] = useState(null);
  
  // View state: 'FORM' or 'RESULT'
  const [view, setView] = useState('FORM');
  const [resultData, setResultData] = useState(null);

  const [formData, setFormData] = useState({
    incomeType: 'MONTHLY',
    monthlyIncome: '',
    annualIncome: '',
    requestedLoanAmount: '',
    creditScore: '',
    monthlyDebt: '',
    employerName: '',
    designation: ''
  });

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const { data } = await api.get('/applications/me');
        if (data.success && data.data) {
          setApplicationId(data.data._id);
          
          // If they already completed eligibility, show it
          if (data.data.currentStage === 'ELIGIBILITY_COMPLETED' && data.data.eligibility) {
            setResultData(data.data.eligibility);
            setView('RESULT');
          }
        } else {
          navigate('/customer/dashboard');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch application details.');
      }
    };
    fetchApp();
  }, []);

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (formData.incomeType === 'MONTHLY' && (!formData.monthlyIncome || formData.monthlyIncome <= 0)) {
      return 'Please enter a valid monthly income';
    }
    if (formData.incomeType === 'ANNUAL' && (!formData.annualIncome || formData.annualIncome <= 0)) {
      return 'Please enter a valid annual income';
    }
    if (!formData.requestedLoanAmount || formData.requestedLoanAmount <= 0) {
      return 'Please enter a valid loan amount';
    }
    if (!formData.creditScore || formData.creditScore < 300 || formData.creditScore > 900) {
      return 'Please enter a valid credit score between 300 and 900';
    }
    if (formData.monthlyDebt === '' || formData.monthlyDebt < 0) {
      return 'Please enter a valid existing monthly debt (can be 0)';
    }
    if (!formData.employerName.trim()) {
      return 'Please enter your employer name';
    }
    if (!formData.designation.trim()) {
      return 'Please enter your designation';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    let currentAppId = applicationId;
    if (!currentAppId) {
      try {
        const { data } = await api.get('/applications/me');
        if (data?.success && data?.data?._id) {
          currentAppId = data.data._id;
          setApplicationId(currentAppId);
        }
      } catch (fetchErr) {
        console.error('Failed to fetch application on submit:', fetchErr);
      }
    }

    if (!currentAppId) {
      setError('Could not retrieve your loan application. Please ensure you are signed in and try again.');
      setLoading(false);
      return;
    }

    try {
      const payload = { 
        ...formData,
        monthlyIncome: formData.monthlyIncome ? Number(formData.monthlyIncome) : undefined,
        annualIncome: formData.annualIncome ? Number(formData.annualIncome) : undefined,
        requestedLoanAmount: Number(formData.requestedLoanAmount),
        creditScore: Number(formData.creditScore),
        monthlyDebt: Number(formData.monthlyDebt)
      };
      
      // Clean up fields based on income type before sending
      if (payload.incomeType === 'MONTHLY') {
        delete payload.annualIncome;
      } else {
        delete payload.monthlyIncome;
      }

      const res = await api.post(`/applications/${currentAppId}/eligibility`, payload);
      
      if (res.data.success) {
        setResultData(res.data.data.eligibility);
        setView('RESULT');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check eligibility.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (view === 'RESULT' && resultData) {
    const isEligible = resultData.status === 'ELIGIBLE';
    const isPartially = resultData.status === 'PARTIALLY_ELIGIBLE';
    const isNotEligible = resultData.status === 'NOT_ELIGIBLE';

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`p-6 text-white text-center ${
            isEligible ? 'bg-green-600' : 
            isPartially ? 'bg-yellow-500' : 
            'bg-red-600'
          }`}>
            <h1 className="text-3xl font-bold mb-2">Loan Eligibility Result</h1>
            <div className="text-xl font-semibold flex items-center justify-center gap-2">
              {isEligible && <span>✓ ELIGIBLE</span>}
              {isPartially && <span>⚠ PARTIALLY ELIGIBLE</span>}
              {isNotEligible && <span>✕ NOT ELIGIBLE</span>}
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Credit Score</p>
                <p className="text-2xl font-bold text-gray-900">{resultData.creditScore}</p>
                <p className="text-sm font-medium text-blue-600">{resultData.creditRating}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Income</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(resultData.monthlyIncome)} <span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Existing Debt</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(resultData.monthlyDebt)} <span className="text-sm font-normal text-gray-500">/mo</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Debt-to-Income (DTI)</p>
                <p className="text-2xl font-bold text-gray-900">{resultData.dti?.toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Requested Loan</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(resultData.requestedLoanAmount)}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Why you received this result:
              </h3>
              <ul className="space-y-3">
                {resultData.reasons?.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {isEligible ? (
                      <span className="text-green-500 mt-0.5">✓</span>
                    ) : isPartially ? (
                      <span className="text-yellow-500 mt-0.5">⚠</span>
                    ) : (
                      <span className="text-red-500 mt-0.5">✕</span>
                    )}
                    <span className="text-gray-700">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex justify-center">
              {!isNotEligible ? (
                <button
                  onClick={() => navigate('/customer/loan-terms')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-colors"
                >
                  Continue to Loan Terms
                </button>
              ) : (
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-xl transition-colors"
                >
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Loan Eligibility Check</h1>
          <p className="text-blue-100 mt-2">Please provide accurate financial details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">Income Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="incomeType"
                    value="MONTHLY"
                    checked={formData.incomeType === 'MONTHLY'}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Monthly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="incomeType"
                    value="ANNUAL"
                    checked={formData.incomeType === 'ANNUAL'}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Annual</span>
                </label>
              </div>
            </div>

            {formData.incomeType === 'MONTHLY' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. 50000"
                  min="0"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. 600000"
                  min="0"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested Loan Amount (₹)</label>
              <input
                type="number"
                name="requestedLoanAmount"
                value={formData.requestedLoanAmount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. 300000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score (CIBIL)</label>
              <input
                type="number"
                name="creditScore"
                value={formData.creditScore}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="300 - 900"
                min="300"
                max="900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Existing Monthly Debts/EMIs (₹)</label>
              <input
                type="number"
                name="monthlyDebt"
                value={formData.monthlyDebt}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. 10000 (Enter 0 if none)"
                min="0"
              />
            </div>

            <div className="col-span-full border-t border-gray-100 pt-6 mt-2">
              <h3 className="text-md font-semibold text-gray-800 mb-4">Employment Details</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
              <input
                type="text"
                name="employerName"
                value={formData.employerName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Job Title"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Calculating...' : 'Check Eligibility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Eligibility;
