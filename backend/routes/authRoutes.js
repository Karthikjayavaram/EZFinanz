import express from 'express';
import {
  registerUser,
  authUser,
  loginPhone,
  verifyLoginPhone,
  googleAuthInitiate,
  googleAuthCallback,
  getUserProfile,
  sendOtp,
  verifyOtp,
  sendEmailOtp,
  verifyEmailOtp,
  addMissingDetails,
  getOtpStatus
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/login-phone', loginPhone);
router.post('/verify-login-phone', verifyLoginPhone);
router.get('/google', googleAuthInitiate);
router.get('/google/callback', googleAuthCallback);

router.get('/me', protect, getUserProfile);
router.get('/otp-status', protect, getOtpStatus);
router.post('/send-otp', protect, sendOtp);
router.post('/verify-otp', protect, verifyOtp);
router.post('/send-email-otp', protect, sendEmailOtp);
router.post('/verify-email-otp', protect, verifyEmailOtp);
router.post('/add-details', protect, addMissingDetails);

export default router;
