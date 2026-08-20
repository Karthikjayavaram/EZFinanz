import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import LoanApplication from '../models/LoanApplication.js';
import AuditLog from '../models/AuditLog.js';
import { OAuth2Client } from 'google-auth-library';
import otpGenerator from 'otp-generator';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
  process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
);

const sendVerificationEmail = async (toEmail, otp) => {
  const subject = 'Your EZFINANZ Email Verification Code';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; margin-top: 0;">EZFINANZ Account Verification</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">Thank you for registering with EZFINANZ. Use the verification code below to verify your email address:</p>
      <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #2563eb;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 12px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  // 1. Try Brevo
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY.trim(),
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME || 'EZFINANZ',
            email: (process.env.BREVO_SENDER_EMAIL || 'karthik.virat22042005@gmail.com').replace('@example.com', '@gmail.com')
          },
          to: [{ email: toEmail }],
          subject,
          htmlContent
        })
      });

      const responseData = await response.json().catch(() => null);
      if (response.ok) {
        console.log(`[EmailOTP:Brevo] Successfully sent real email OTP to ${toEmail}. MessageId: ${responseData?.messageId || 'OK'}`);
        return { success: true, provider: 'brevo', data: responseData };
      } else {
        console.warn(`[EmailOTP:Brevo] Brevo API Error (Status ${response.status}):`, responseData);
      }
    } catch (err) {
      console.warn('[EmailOTP:Brevo] Brevo dispatch network error:', err.message);
    }
  }

  // 2. Try Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'EZFINANZ <onboarding@resend.dev>',
          to: [toEmail],
          subject,
          html: htmlContent
        })
      });

      if (response.ok) {
        console.log(`[EmailOTP:Resend] Successfully sent real email OTP to ${toEmail}`);
        return { success: true, provider: 'resend' };
      }
    } catch (err) {
      console.warn('[EmailOTP:Resend] Resend dispatch error:', err.message);
    }
  }

  console.log(`[EmailOTP:LocalSimulation] Email intended for ${toEmail} | Code: ${otp}`);
  return { success: true, provider: 'simulation' };
};

// Helper to update application stage if both verified
const updateApplicationStage = async (userId) => {
  const user = await User.findById(userId);
  if (user && user.emailVerified && user.phoneVerified) {
    let application = await LoanApplication.findOne({ userId });
    if (application && (application.currentStage === 'REGISTERED' || application.currentStage === 'EMAIL_VERIFIED')) {
      application.currentStage = 'PHONE_VERIFIED';
      await application.save();
      await AuditLog.create({
        applicationId: application._id,
        event: 'PHONE_VERIFIED',
        performedBy: userId,
      });
    }
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or Phone is required' });
    }

    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });

    let userExists = null;
    if (query.length > 0) {
      userExists = await User.findOne({ $or: query });
    }

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with that email or phone' });
    }

    // Normal users are always registered with CUSTOMER role
    const userRole = 'CUSTOMER';

    const userData = { name, password, role: userRole };
    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    const user = await User.create(userData);

    if (user) {
      let generatedEmailOtp = null;
      let generatedPhoneOtp = null;
      let emailDispatched = false;

      // Auto-generate and send OTPs if not verified
      if (!user.emailVerified && user.email) {
        generatedEmailOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        user.emailOtp = generatedEmailOtp;
        user.emailOtpExpiry = Date.now() + 10 * 60 * 1000;

        const emailResult = await sendVerificationEmail(user.email, generatedEmailOtp);
        emailDispatched = emailResult?.provider === 'brevo' || emailResult?.provider === 'resend';
      }

      if (!user.phoneVerified && user.phone) {
        generatedPhoneOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        user.phoneOtp = generatedPhoneOtp;
        user.phoneOtpExpiry = Date.now() + 10 * 60 * 1000;
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[SMS Simulation] Generated Phone OTP ${generatedPhoneOtp} for ${user.phone}`);
        }
      }

      await user.save();

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          token: generateToken(user._id),
          emailOtp: generatedEmailOtp,
          phoneOtp: generatedPhoneOtp,
          emailDispatched
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && user.password && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Login via Phone - Request OTP
// @route   POST /api/auth/login-phone
// @access  Public
export const loginPhone = async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    user.phoneOtp = otp;
    user.phoneOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV MODE] Generated Login OTP ${otp} for ${phone}`);
    }
    
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify Phone Login OTP
// @route   POST /api/auth/verify-login-phone
// @access  Public
export const verifyLoginPhone = async (req, res) => {
  const { phone, otp } = req.body;
  try {
    const user = await User.findOne({ phone, phoneOtp: otp, phoneOtpExpiry: { $gt: Date.now() } });
    if (user) {
      user.phoneOtp = undefined;
      user.phoneOtpExpiry = undefined;
      await user.save();
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          token: generateToken(user._id),
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
export const googleAuthInitiate = (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(400).json({ success: false, message: 'Google Client ID is missing' });
  }
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&response_type=code&scope=email%20profile`;
  res.redirect(redirectUrl);
};

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = async (req, res) => {
  const { code } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=Google authentication failed. Please try again.`);
  }

  try {
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    });
    
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        return res.redirect(`${FRONTEND_URL}/login?error=An account already exists with this email. Please log in using your existing credentials and link Google from account settings.`);
      }

      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        authProvider: 'google',
        emailVerified: true,
        role: 'CUSTOMER'
      });
    }

    const token = generateToken(user._id);
    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}`);
  } catch (error) {
    console.error(error);
    res.redirect(`${FRONTEND_URL}/login?error=Google authentication failed. Please try again.`);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
// @access  Private
export const sendOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.phone) {
      return res.status(400).json({ success: false, message: 'No phone number associated with account' });
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    user.phoneOtp = otp;
    user.phoneOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SMS Simulation] Generated Phone OTP ${otp} for ${user.phone}`);
    }
    
    res.json({ 
      success: true, 
      message: 'Phone verification code generated',
      data: { phoneOtp: otp, phone: user.phone }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user.phoneOtp === otp && user.phoneOtpExpiry > Date.now()) {
      user.phoneVerified = true;
      user.phoneOtp = undefined;
      user.phoneOtpExpiry = undefined;
      await user.save();
      await updateApplicationStage(user._id);
      res.json({ 
        success: true, 
        message: 'Phone verified successfully', 
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        } 
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send Email OTP
// @route   POST /api/auth/send-email-otp
// @access  Private
export const sendEmailOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.email) {
      return res.status(400).json({ success: false, message: 'No email associated with account' });
    }
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    user.emailOtp = otp;
    user.emailOtpExpiry = Date.now() + 10 * 60 * 1000;
    
    const emailResult = await sendVerificationEmail(user.email, otp);
    const emailDispatched = emailResult?.provider === 'brevo' || emailResult?.provider === 'resend';

    await user.save();
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Email Verification] Generated Email OTP ${otp} for ${user.email}`);
    }
    
    res.json({ 
      success: true, 
      message: emailDispatched ? 'Verification code sent to your email address' : 'Verification code generated',
      data: { emailOtp: otp, email: user.email, emailDispatched }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Current Active OTPs (Simulation & status HUD)
// @route   GET /api/auth/otp-status
// @access  Private
export const getOtpStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let updated = false;

    // Ensure active email OTP exists if unverified
    if (!user.emailVerified && user.email && (!user.emailOtp || user.emailOtpExpiry <= Date.now())) {
      user.emailOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
      user.emailOtpExpiry = Date.now() + 10 * 60 * 1000;
      updated = true;
      sendVerificationEmail(user.email, user.emailOtp).catch(err => console.warn('Background email send error:', err.message));
    }

    // Ensure active phone OTP exists if unverified
    if (!user.phoneVerified && user.phone && (!user.phoneOtp || user.phoneOtpExpiry <= Date.now())) {
      user.phoneOtp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
      user.phoneOtpExpiry = Date.now() + 10 * 60 * 1000;
      updated = true;
    }

    if (updated) {
      await user.save();
    }

    res.json({
      success: true,
      data: {
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        emailOtp: user.emailOtp || null,
        phoneOtp: user.phoneOtp || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email-otp
// @access  Private
export const verifyEmailOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user.emailOtp === otp && user.emailOtpExpiry > Date.now()) {
      user.emailVerified = true;
      user.emailOtp = undefined;
      user.emailOtpExpiry = undefined;
      await user.save();
      await updateApplicationStage(user._id);
      res.json({ 
        success: true, 
        message: 'Email verified successfully', 
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add missing details (email or phone)
// @route   POST /api/auth/add-details
// @access  Private
export const addMissingDetails = async (req, res) => {
  const { email, phone } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (email && !user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
      user.email = email;
    }
    if (phone && !user.phone) {
      const exists = await User.findOne({ phone });
      if (exists) return res.status(400).json({ success: false, message: 'Phone already in use' });
      user.phone = phone;
    }
    await user.save();
    res.json({ success: true, message: 'Details updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
