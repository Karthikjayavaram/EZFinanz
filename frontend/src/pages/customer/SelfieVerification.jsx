import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  RotateCw,
  Sparkles,
  ArrowRight,
  Clock,
  Check,
  X,
  Lock,
  UserCheck,
  Info,
  SwitchCamera,
  Sun,
  Contrast,
  Sliders,
  FlipHorizontal,
  Wand2,
  Timer,
  Zap,
  ImageIcon
} from 'lucide-react';

export default function SelfieVerification() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState(null);

  // Camera & Capture State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (back)
  const [originalCapturedImage, setOriginalCapturedImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [videoReady, setVideoReady] = useState(false);

  // Clarity & Capture Enhancements
  const [countdown, setCountdown] = useState(null);
  const [flashActive, setFlashActive] = useState(false);
  const [screenLightActive, setScreenLightActive] = useState(false);

  // Photo Editing Controls State
  const [brightness, setBrightness] = useState(100); // 60 to 140
  const [contrast, setContrast] = useState(100); // 60 to 140
  const [saturation, setSaturation] = useState(100); // 60 to 140
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isFlipped, setIsFlipped] = useState(false);

  // Completed / Waiting for admin review state
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const forceEdit = urlParams.get('edit') === 'true';

    fetchApplicationData(forceEdit);
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure stream is properly attached to video whenever cameraActive or video element mounts
  useEffect(() => {
    if (cameraActive && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().then(() => {
          setVideoReady(true);
        }).catch((e) => console.warn('Video play caught:', e));
      };
    }
  }, [cameraActive]);

  const fetchApplicationData = async (forceEdit = false) => {
    try {
      setLoading(true);
      const { data } = await api.get('/applications/me');
      if (data.success && data.data) {
        setApplication(data.data);
        const selfieUrl = data.data.selfie?.url;
        
        if (selfieUrl) {
          setOriginalCapturedImage(selfieUrl);
          setEditedImage(selfieUrl);
        }

        if ((data.data.currentStage === 'WAITING_FOR_ADMIN' || selfieUrl) && !forceEdit) {
          setIsSubmittedSuccess(true);
        } else if (forceEdit) {
          setIsSubmittedSuccess(false);
        }
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error('Failed to load application:', err);
      setError('Could not load application. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Start WebCam
  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setCameraError('');
    setError('');
    setVideoReady(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by your browser. Please use photo upload.');
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (hdErr) {
        // Fallback with basic constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      setCameraActive(true);

      // Attach immediately if ref already mounted
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().then(() => {
            setVideoReady(true);
          }).catch((e) => console.warn('Video play error:', e));
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(
        'Could not access camera. Please check camera permissions or use the photo upload option below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setVideoReady(false);
  };

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  // Trigger 3s countdown capture
  const handleStartCaptureWithTimer = () => {
    if (countdown !== null) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          performCapture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // High-Resolution Snapshot Capture
  const performCapture = () => {
    const video = videoRef.current;
    if (!video) {
      setError('Camera not ready. Please try again.');
      return;
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (width === 0 || height === 0) {
      setError('Camera stream is still initializing. Please wait 1 second and click capture again.');
      return;
    }

    // Flash animation effect
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 300);

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    if (facingMode === 'user') {
      // Mirror image horizontally for natural selfie orientation
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
      setOriginalCapturedImage(dataUrl);
      setEditedImage(dataUrl);
      resetEditFilters();
      setUploadFile(null);
      stopCamera();
    } catch (e) {
      console.error('Canvas capture failed:', e);
      setError('Failed to process photo from camera. Please try again or upload a photo.');
    }
  };

  // File Upload Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('File size must be less than 8MB.');
      return;
    }

    stopCamera();
    setUploadFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalCapturedImage(reader.result);
      setEditedImage(reader.result);
      resetEditFilters();
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Photo Editing Helpers
  const resetEditFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setIsFlipped(false);
  };

  const applyAutoEnhance = () => {
    setBrightness(112);
    setContrast(115);
    setSaturation(105);
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Compute live CSS filter style for real-time preview
  const liveFilterStyle = useMemo(() => {
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
      transform: `rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
      transition: 'filter 0.15s ease, transform 0.2s ease'
    };
  }, [brightness, contrast, saturation, rotation, isFlipped]);

  // Export processed image from canvas with all edits baked in
  const generateProcessedImageDataUrl = () => {
    return new Promise((resolve) => {
      if (!originalCapturedImage) return resolve(null);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const isRotated90or270 = rotation === 90 || rotation === 270;
        const canvas = document.createElement('canvas');
        canvas.width = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
        canvas.height = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Apply CSS-like filter
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        if (isFlipped) {
          ctx.scale(-1, 1);
        }

        ctx.drawImage(
          img,
          -img.naturalWidth / 2,
          -img.naturalHeight / 2,
          img.naturalWidth,
          img.naturalHeight
        );
        ctx.restore();

        try {
          resolve(canvas.toDataURL('image/jpeg', 0.98));
        } catch {
          resolve(originalCapturedImage);
        }
      };
      img.onerror = () => {
        resolve(originalCapturedImage);
      };
      img.src = originalCapturedImage;
    });
  };

  const retakePhoto = () => {
    setOriginalCapturedImage(null);
    setEditedImage(null);
    setUploadFile(null);
    resetEditFilters();
    setError('');
    startCamera();
  };

  // Convert Base64 data URL to File for multipart upload
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async () => {
    if (!originalCapturedImage) {
      setError('Please capture or upload a live selfie photo first.');
      return;
    }

    let app = application;
    if (!app?._id) {
      try {
        const { data } = await api.get('/applications/me');
        if (data?.success && data?.data?._id) {
          app = data.data;
          setApplication(app);
        }
      } catch (fetchErr) {
        console.error('Failed to retrieve application:', fetchErr);
      }
    }

    if (!app?._id) {
      setError('Could not retrieve your loan application. Please ensure you are logged in and try again.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Bake all brightness, contrast, rotation, and mirror edits into the final high-res image
      const finalProcessedImage = await generateProcessedImageDataUrl();

      let finalUrl = finalProcessedImage || originalCapturedImage;
      let publicId = `selfie_${Date.now()}`;

      // Upload file via backend upload API
      try {
        const fileToUpload = dataURLtoFile(finalUrl, `selfie_${Date.now()}.jpg`);
        const formData = new FormData();
        formData.append('file', fileToUpload);

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data.success && uploadRes.data.data?.url) {
          finalUrl = uploadRes.data.data.url;
          publicId = uploadRes.data.data.publicId || publicId;
        }
      } catch (uploadErr) {
        console.warn('Direct upload fallback:', uploadErr);
      }

      // Submit selfie to application endpoint
      const res = await api.post(`/applications/${application._id}/selfie`, {
        url: finalUrl,
        publicId
      });

      if (res.data.success) {
        setIsSubmittedSuccess(true);
        setApplication(res.data.data);
      }
    } catch (err) {
      console.error('Selfie submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit selfie. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Initializing high-definition selfie verification...</p>
        </div>
      </div>
    );
  }

  // Final Success / Waiting for Admin State
  if (isSubmittedSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 border-4 border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce-short">
            <Clock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
              Status: Waiting for Admin Review
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Application Submitted Successfully!
            </h1>
            <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
              Your personal loan application has reached the final verification stage. Our credit team is reviewing your details.
            </p>
          </div>

          {/* Submission Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left max-w-xl mx-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Application Reference</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                #{application?.applicationNumber || 'EZF-2026-000001'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Applicant</span>
                <span className="font-bold text-slate-800">{application?.kyc?.fullName || 'Customer'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Loan Amount</span>
                <span className="font-bold text-blue-600 text-sm">
                  {formatCurrency(application?.loanDetails?.amount || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Tenure & Monthly EMI</span>
                <span className="font-bold text-slate-800">
                  {application?.loanDetails?.tenure} Mos @ {formatCurrency(application?.loanDetails?.emi || 0)}/mo
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Disbursement Account</span>
                <span className="font-bold text-emerald-700 truncate block">
                  {application?.bankAccount?.bankName} (••{application?.bankAccount?.accountNumber?.slice(-4)})
                </span>
              </div>
            </div>

            {editedImage && (
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={editedImage}
                    alt="Submitted Selfie"
                    className="w-14 h-14 rounded-xl object-cover border-2 border-slate-200 shadow-xs"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Verification Photo</span>
                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Secured & Attached
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmittedSuccess(false)}
                    className="text-xs bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Edit Photo
                  </button>

                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all text-sm"
            >
              Go to Dashboard & Track Status
            </button>

            <button
              type="button"
              onClick={() => setIsSubmittedSuccess(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-xl transition-all text-sm flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              Edit / Replace Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 space-y-8 ${screenLightActive ? 'bg-white rounded-3xl p-4 shadow-2xl ring-8 ring-white' : ''}`}>
      {/* Header & Stepper */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" /> Step 8: Live Selfie Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Live Photo & Identity Verification
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Take a clear HD selfie with your device camera or upload a photo. You can adjust lighting, contrast, and orientation before final submission.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-xl font-medium">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>AI Clarity & Liveness</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full w-1/5"></div>
          <div className="bg-emerald-500 h-full w-1/5 border-l border-white"></div>
          <div className="bg-emerald-500 h-full w-1/5 border-l border-white"></div>
          <div className="bg-emerald-500 h-full w-1/5 border-l border-white"></div>
          <div className="bg-blue-600 h-full w-1/5 border-l border-white"></div>
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-2">
          <span>✓ KYC</span>
          <span>✓ Eligibility</span>
          <span>✓ EMI Selected</span>
          <span>✓ Bank Linked</span>
          <span className="text-blue-600 font-bold">● Live Selfie</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 text-sm text-red-700 font-medium">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold text-sm">✕</button>
        </div>
      )}

      {/* Main Grid: Equal Two-Card Studio & Standards Layout (50% / 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Camera Viewfinder / Photo Studio */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-wrap gap-2">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                {originalCapturedImage ? 'Photo Editor & Clarity Tools' : 'HD Live Camera Viewfinder'}
              </h3>

              {cameraActive && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScreenLightActive(!screenLightActive)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                      screenLightActive ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Screen Light Boost for low-light rooms"
                  >
                    <Zap className="w-3.5 h-3.5" /> Light Boost
                  </button>

                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" /> Switch
                  </button>
                </div>
              )}
            </div>

            {/* Viewfinder / Studio Frame Container */}
            <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-slate-800">
              {/* Screen Flash Animation */}
              {flashActive && (
                <div className="absolute inset-0 bg-white z-50 animate-fade-out pointer-events-none"></div>
              )}

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/50 z-40 flex items-center justify-center pointer-events-none backdrop-blur-xs">
                  <span className="text-7xl font-black text-white animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Captured & Filtered Image Display */}
              {originalCapturedImage ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-900 p-2">
                  <img
                    src={originalCapturedImage}
                    alt="Captured Selfie"
                    style={liveFilterStyle}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Check className="w-3.5 h-3.5" /> HD Ready
                  </div>
                </div>
              ) : (
                /* Live HD Camera Stream Container (Always Rendered to avoid null ref) */
                <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${!cameraActive ? 'hidden' : ''}`}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  />

                  {/* Face Outline Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-76 border-2 border-dashed border-white/90 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"></div>
                  </div>

                  <span className="absolute bottom-4 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    Align your face inside the oval
                  </span>
                </div>
              )}

              {/* Inactive Camera State Message */}
              {!originalCapturedImage && !cameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold text-sm">HD Camera Ready</p>
                    <p className="text-slate-400 text-xs max-w-xs mx-auto">
                      Click below to open your camera in full high definition.
                    </p>
                  </div>
                  {cameraError && (
                    <p className="text-red-400 text-xs bg-red-950/60 p-2.5 rounded-xl max-w-sm mx-auto">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Hidden Canvas for capture processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* In-Browser Photo Editing Controls (Shown when Photo is Captured) */}
            {originalCapturedImage && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" /> Photo Adjustments
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={applyAutoEnhance}
                      className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-md font-bold flex items-center gap-1 border border-blue-200 transition-colors"
                    >
                      <Wand2 className="w-3.5 h-3.5" /> Auto-Enhance
                    </button>

                    <button
                      type="button"
                      onClick={resetEditFilters}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Brightness */}
                  <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center font-semibold text-slate-700">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Sun className="w-3 h-3 text-amber-500" /> Brightness
                      </span>
                      <span className="text-slate-500 text-[10px]">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center font-semibold text-slate-700">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Contrast className="w-3 h-3 text-indigo-500" /> Contrast
                      </span>
                      <span className="text-slate-500 text-[10px]">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center font-semibold text-slate-700">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3 h-3 text-emerald-500" /> Saturation
                      </span>
                      <span className="text-slate-500 text-[10px]">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={140}
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Transform Actions (Rotate & Mirror) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={rotateClockwise}
                      className="text-xs bg-white text-slate-700 hover:bg-slate-100 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border border-slate-200 transition-colors"
                    >
                      <RotateCw className="w-3 h-3" /> Rotate 90°
                    </button>

                    <button
                      type="button"
                      onClick={toggleFlip}
                      className="text-xs bg-white text-slate-700 hover:bg-slate-100 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border border-slate-200 transition-colors"
                    >
                      <FlipHorizontal className="w-3 h-3" /> Mirror
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {rotation !== 0 ? `Rotated ${rotation}°` : ''} {isFlipped ? '• Mirrored' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {originalCapturedImage ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Retake Selfie
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Confirm & Submit <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : cameraActive ? (
              <div className="flex flex-wrap gap-3">
                {/* Instant Capture */}
                <button
                  type="button"
                  onClick={performCapture}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" /> Snap Photo Now
                </button>

                {/* 3s Timer Capture */}
                <button
                  type="button"
                  onClick={handleStartCaptureWithTimer}
                  disabled={countdown !== null}
                  className="py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Hands-free 3 second timer"
                >
                  <Timer className="w-4 h-4" /> 3s Timer
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Camera className="w-5 h-5" /> Open HD Camera & Take Selfie
                </button>

                {/* Alternative: File Upload */}
                <div className="relative text-center pt-1">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                    Or Upload Photo from Device
                  </span>
                  <label className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 text-slate-700 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-all">
                    <Upload className="w-4 h-4 text-slate-500" />
                    Choose Photo from Gallery / Device
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Clarity Tips & Verification Standards (Equal 50% width and height) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Photo Clarity Standards
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Clear photos are approved within minutes. Follow these guidelines:
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/80 text-emerald-900 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Use Good Light:</strong> Face a window or light source. Use the <em>Light Boost</em> toggle if you're in a dimly lit room.
                </span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/80 text-emerald-900 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Hold Steady:</strong> Use the <strong>3s Timer</strong> button to avoid hand shake when tapping the shutter.
                </span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/80 text-blue-900 border border-blue-100">
                <Sliders className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Fine-tune with Editor:</strong> If the photo is too dark or washed out, adjust <em>Brightness & Contrast</em> sliders or click <em>Auto-Enhance</em>.
                </span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50/80 text-red-900 border border-red-100">
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>No Coverings:</strong> Remove sunglasses, hats, or masks before taking the selfie.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-start gap-3 text-xs text-slate-600 mt-auto">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              Your selfie will be encrypted and compared against your KYC photo ID for instant liveness and identity match.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
