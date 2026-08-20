import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, CheckCircle2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const KYCForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const preselectedLoanType = location.state?.loanType;
  const [showLoanSelector, setShowLoanSelector] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    dob: '',
    gender: 'MALE',
    address: '',
    idType: 'PAN',
    idNumber: '',
    loanType: preselectedLoanType || 'Personal Loan',
  });
  
  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [applicationId, setApplicationId] = useState(null);

  // Fetch application ID on mount
  React.useEffect(() => {
    const fetchApp = async () => {
      try {
        setPageLoading(true);
        const { data } = await api.get('/applications/me');
        if (data.success && data.data) {
          setApplicationId(data.data._id);
          const app = data.data;
          setFormData(prev => ({
            fullName: app.kyc?.fullName || prev.fullName,
            dob: app.kyc?.dob ? new Date(app.kyc.dob).toISOString().split('T')[0] : prev.dob,
            gender: app.kyc?.gender || prev.gender,
            address: app.kyc?.address || prev.address,
            idType: app.kyc?.idType || prev.idType,
            idNumber: app.kyc?.idNumber || prev.idNumber,
            loanType: preselectedLoanType || app.loanType || prev.loanType || 'Personal Loan',
          }));
        } else {
          // No active application — send user back to dashboard to start fresh
          navigate('/customer/dashboard');
        }
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError('Could not retrieve your loan application. Please check your connection or sign in again.');
      } finally {
        setPageLoading(false);
      }
    };
    fetchApp();
  }, [preselectedLoanType, navigate]);

  React.useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setIdFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setError('Could not find or create your loan application. Please ensure you are logged in and try again.');
      setLoading(false);
      return;
    }

    try {
      let idDocumentUrl = null;
      let idDocumentPublicId = null;

      // 1. Upload file if exists
      if (idFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', idFile);
        
        const uploadRes = await api.post('/upload', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (uploadRes.data.success) {
          idDocumentUrl = uploadRes.data.data.url;
          idDocumentPublicId = uploadRes.data.data.publicId;
        }
      }

      // 2. Submit KYC
      const payload = {
        ...formData,
        idDocumentUrl,
        idDocumentPublicId,
      };

      const res = await api.post(`/applications/${currentAppId}/kyc`, payload);
      
      if (res.data.success) {
        navigate('/customer/eligibility');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit KYC details.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 text-sm font-medium">Loading KYC application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">KYC Verification</h1>
        <p className="text-slate-600 mt-1">Please provide your identity details to continue with your loan application.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline ml-3 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Category Banner / Selector */}
          <div className="space-y-3 pb-4 border-b border-slate-200">
            {formData.loanType && !showLoanSelector ? (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm shadow-blue-600/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                        Selected Loan Category
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Auto-filled</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {formData.loanType}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLoanSelector(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-slate-800">
                      Select Required Loan Category
                    </label>
                    <p className="text-xs text-slate-500">
                      Choose the loan category that best matches your requirement.
                    </p>
                  </div>
                  {formData.loanType && (
                    <button
                      type="button"
                      onClick={() => setShowLoanSelector(false)}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Done
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {[
                    { id: 'Personal Loan', name: 'Personal Loan', icon: '💰', desc: 'Instant cash' },
                    { id: 'Medical & Health Loan', name: 'Medical & Health', icon: '🚑', desc: 'Healthcare' },
                    { id: 'Education & Upskilling', name: 'Education & Skill', icon: '🎓', desc: 'Courses & fees' },
                    { id: 'Business & MSME Credit', name: 'Business Credit', icon: '💼', desc: 'Working capital' },
                    { id: 'Two-Wheeler & EV Loan', name: 'Two-Wheeler & EV', icon: '⚡', desc: 'Bikes & EV' },
                    { id: 'Home Renovation & Decor', name: 'Home Renovation', icon: '🏡', desc: 'Interiors & repair' },
                    { id: 'Debt Consolidation', name: 'Debt Consolidation', icon: '📊', desc: 'Combine debt' },
                    { id: 'Travel & Vacation Loan', name: 'Travel & Holiday', icon: '✈️', desc: 'Trips & flights' },
                    { id: 'Wedding & Celebration', name: 'Wedding Loan', icon: '💍', desc: 'Events & venues' },
                    { id: 'Consumer Tech & Gadgets', name: 'Gadgets & Tech', icon: '💻', desc: 'Devices & PC' },
                    { id: 'Solar & Green Energy', name: 'Solar & Green', icon: '☀️', desc: 'Rooftop solar' },
                    { id: 'Women Entrepreneur Loan', name: 'Women Startup', icon: '👩‍💼', desc: 'Empowerment' },
                    { id: 'Agri-Tech & Farm Equipment', name: 'Agri & Farm', icon: '🚜', desc: 'Farm equipment' },
                    { id: 'Gig & Freelancer Credit', name: 'Gig Freelancer', icon: '🎨', desc: 'Invoice bridge' },
                    { id: 'Used Car & Pre-Owned Vehicle', name: 'Pre-Owned Car', icon: '🚗', desc: 'Vehicle finance' },
                    { id: 'Rental Deposit & Relocation', name: 'Rental Deposit', icon: '🛋️', desc: 'Relocation' }
                  ].map((cat) => {
                    const selected = formData.loanType === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setFormData({ ...formData, loanType: cat.id });
                          setShowLoanSelector(false);
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          selected
                            ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xl mb-1">{cat.icon}</div>
                        <div className="font-bold text-xs text-slate-900 leading-snug">{cat.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Karthik Jayavaram"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ID Type</label>
              <select
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="PAN">PAN Card</option>
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                placeholder="ABCDE1234F"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Plot No. 42, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3">Upload ID Document (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${idFile ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {idFile ? (
                    <>
                      <CheckCircle2 className="w-10 h-10 text-blue-500 mb-3" />
                      <p className="mb-2 text-sm font-medium text-slate-700">{idFile.name}</p>
                      <p className="text-xs text-slate-500">{(idFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="mb-2 text-sm text-slate-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-400">PNG, JPG or PDF (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/jpeg,image/png,application/pdf" />
              </label>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KYCForm;
