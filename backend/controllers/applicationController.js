import LoanApplication from '../models/LoanApplication.js';
import AuditLog from '../models/AuditLog.js';
import { calculateEligibility } from '../services/eligibilityService.js';
import { calculateLoan } from '../services/loanService.js';

// Helper to generate unique App Number
const generateAppNumber = async () => {
  let appNumber = '';
  let exists = true;
  while (exists) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    appNumber = `EZF-2026-${randomNum}`;
    const found = await LoanApplication.findOne({ applicationNumber: appNumber });
    if (!found) exists = false;
  }
  return appNumber;
};

// @desc    Get current user's application
// @route   GET /api/applications/me
// @access  Private/Customer
export const getMyApplication = async (req, res) => {
  try {
    const application = await LoanApplication.findOne({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    if (!application) {
      return res.json({ success: true, data: null });
    }

    const appObj = application.toObject();
    // Do NOT disclose internal admin rejection reason to customer
    if (appObj.adminReview) {
      delete appObj.adminReview.applicationRejectionReason;
    }

    res.json({ success: true, data: appObj });
  } catch (error) {
    console.error('getMyApplication error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get ALL applications for current user (history)
// @route   GET /api/applications/history
// @access  Private/Customer
export const getMyApplicationHistory = async (req, res) => {
  try {
    const applications = await LoanApplication.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    const sanitized = applications.map(app => {
      const obj = app.toObject();
      if (obj.adminReview) {
        delete obj.adminReview.applicationRejectionReason;
      }
      return obj;
    });

    res.json({ success: true, data: sanitized });
  } catch (error) {
    console.error('getMyApplicationHistory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create a new loan application (for repeat borrowers / multiple loans)
// @route   POST /api/applications/new
// @access  Private/Customer
export const createNewApplication = async (req, res) => {
  const { loanType } = req.body || {};
  try {
    // Ensure user has no currently active non-completed application in progress
    const existing = await LoanApplication.findOne({
      userId: req.user._id,
      status: { $nin: ['DISBURSED', 'REJECTED'] },
      currentStage: { $nin: ['DISBURSEMENT_CONFIRMED', 'APPLICATION_REJECTED'] }
    });

    if (existing) {
      if (loanType && ['REGISTERED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED'].includes(existing.currentStage)) {
        existing.loanType = loanType;
        await existing.save();
      }
      return res.status(400).json({
        success: false,
        message: 'You already have an active loan application in progress.',
        data: existing
      });
    }

    const application = await LoanApplication.create({
      userId: req.user._id,
      applicationNumber: await generateAppNumber(),
      loanType: loanType || 'Personal Loan',
      currentStage: req.user.phoneVerified ? 'PHONE_VERIFIED' : (req.user.emailVerified ? 'EMAIL_VERIFIED' : 'REGISTERED')
    });

    await AuditLog.create({
      applicationId: application._id,
      event: 'APPLICATION_CREATED',
      performedBy: req.user._id,
      metadata: { loanType: application.loanType }
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    console.error('createNewApplication error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    Update KYC
// @route   POST /api/applications/:id/kyc
// @access  Private/Customer
export const submitKYC = async (req, res) => {
  const { fullName, dob, gender, address, idType, idNumber, idDocumentUrl, idDocumentPublicId, loanType } = req.body;
  
  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app || app.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (loanType) {
      app.loanType = loanType;
    }

    app.kyc = {
      fullName, dob, gender, address, idType, idNumber, idDocumentUrl, idDocumentPublicId, completedAt: new Date()
    };
    app.currentStage = 'KYC_COMPLETED';
    await app.save();

    await AuditLog.create({ 
      applicationId: app._id, 
      event: 'KYC_COMPLETED', 
      performedBy: req.user._id,
      metadata: { loanType: app.loanType }
    });
    
    res.json({ success: true, data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update Bank Account Details for current user (from Profile)
// @route   PUT /api/applications/bank-account
// @access  Private/Customer
export const updateUserBankAccount = async (req, res) => {
  const { accountHolderName, accountNumber, ifsc, bankName, accountType, branchName } = req.body;

  if (!accountHolderName || !accountNumber || !ifsc || !bankName) {
    return res.status(400).json({
      success: false,
      message: 'Account holder name, account number, IFSC code, and bank name are required.'
    });
  }

  const cleanIfsc = String(ifsc).trim().toUpperCase();
  const cleanAccount = String(accountNumber).trim();

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid IFSC Code format (e.g., HDFC0001234).'
    });
  }

  if (!/^\d{9,18}$/.test(cleanAccount)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Account Number. It must be between 9 and 18 digits.'
    });
  }

  try {
    const applications = await LoanApplication.find({
      userId: req.user._id,
      status: { $ne: 'DISBURSED' }
    });

    const bankData = {
      accountHolderName: String(accountHolderName).trim(),
      accountNumber: cleanAccount,
      ifsc: cleanIfsc,
      bankName: String(bankName).trim(),
      accountType: accountType === 'CURRENT' ? 'CURRENT' : 'SAVINGS',
      branchName: branchName ? String(branchName).trim() : undefined,
      isVerified: true,
      addedAt: new Date()
    };

    for (const app of applications) {
      app.bankAccount = bankData;
      await app.save();
    }

    res.json({ success: true, message: 'Bank account updated successfully', data: bankData });
  } catch (error) {
    console.error('updateUserBankAccount error:', error);
    res.status(500).json({ success: false, message: 'Server error updating bank account' });
  }
};

// @desc    Check Eligibility
// @route   POST /api/applications/:id/eligibility
// @access  Private/Customer
export const checkEligibility = async (req, res) => {
  const { 
    incomeType, 
    monthlyIncome, 
    annualIncome, 
    requestedLoanAmount, 
    creditScore, 
    monthlyDebt, 
    employerName, 
    designation 
  } = req.body;
  
  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app || app.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Validation
    if (requestedLoanAmount <= 0) return res.status(400).json({ success: false, message: 'Requested loan amount must be greater than 0' });
    if (creditScore < 300 || creditScore > 900) return res.status(400).json({ success: false, message: 'Invalid credit score range' });
    if (monthlyDebt < 0) return res.status(400).json({ success: false, message: 'Monthly debt cannot be negative' });
    
    // Determine monthly income based on type
    let calculatedMonthlyIncome = 0;
    let finalAnnualIncome = null;
    let finalMonthlyIncome = null;

    if (incomeType === 'ANNUAL') {
      if (!annualIncome || annualIncome <= 0) return res.status(400).json({ success: false, message: 'Annual income must be greater than 0' });
      calculatedMonthlyIncome = annualIncome / 12;
      finalAnnualIncome = annualIncome;
      finalMonthlyIncome = calculatedMonthlyIncome;
    } else {
      if (!monthlyIncome || monthlyIncome <= 0) return res.status(400).json({ success: false, message: 'Monthly income must be greater than 0' });
      calculatedMonthlyIncome = monthlyIncome;
      finalMonthlyIncome = monthlyIncome;
    }

    const result = calculateEligibility({ 
      monthlyIncome: calculatedMonthlyIncome, 
      requestedLoanAmount, 
      creditScore, 
      monthlyDebt 
    });

    app.eligibility = {
      ...result,
      incomeType,
      monthlyIncome: finalMonthlyIncome,
      annualIncome: finalAnnualIncome,
      requestedLoanAmount,
      creditScore,
      monthlyDebt,
      employerName,
      designation,
      calculatedAt: new Date()
    };
    app.currentStage = 'ELIGIBILITY_COMPLETED';
    await app.save();

    await AuditLog.create({ applicationId: app._id, event: 'ELIGIBILITY_COMPLETED', performedBy: req.user._id });

    res.json({ success: true, data: app });
  } catch(error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Calculate Loan (Preview)
// @route   POST /api/applications/calculate-loan
// @access  Private/Customer
export const previewLoan = (req, res) => {
  const { amount, tenure, interestRate } = req.body;
  if (!amount || !tenure) {
    return res.status(400).json({ success: false, message: 'Loan amount and tenure are required' });
  }
  const rate = interestRate ? Number(interestRate) : 12;
  const result = calculateLoan(Number(amount), Number(tenure), rate);
  res.json({ success: true, data: result });
};

// @desc    Submit Loan Details
// @route   POST /api/applications/:id/loan
// @access  Private/Customer
export const submitLoanDetails = async (req, res) => {
  const { amount, tenure, interestRate } = req.body;

  if (!amount || !tenure) {
    return res.status(400).json({ success: false, message: 'Loan amount and tenure are required' });
  }

  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app || app.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const rate = interestRate ? Number(interestRate) : (app.eligibility?.applicableInterestRate || 12);
    const result = calculateLoan(Number(amount), Number(tenure), rate);

    app.loanDetails = {
      amount: result.amount,
      tenure: result.tenure,
      interestRate: result.interestRate,
      emi: result.emi,
      totalInterest: result.totalInterest,
      totalRepayment: result.totalRepayment,
      processingFee: result.processingFee,
      gst: result.gst,
      otherCharges: result.otherCharges,
      totalCharges: result.totalCharges,
      netDisbursement: result.netDisbursement,
      irr: result.irr,
      selectedAt: new Date(),
    };
    app.currentStage = 'EMI_SELECTED';
    await app.save();

    await AuditLog.create({ applicationId: app._id, event: 'LOAN_SELECTED', performedBy: req.user._id });

    res.json({ success: true, data: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit Bank Details
// @route   POST /api/applications/:id/bank
// @access  Private/Customer
export const submitBankDetails = async (req, res) => {
  const { accountHolderName, accountNumber, ifsc, bankName, accountType, branchName } = req.body;

  if (!accountHolderName || !accountNumber || !ifsc || !bankName) {
    return res.status(400).json({ 
      success: false, 
      message: 'Account holder name, account number, IFSC code, and bank name are required.' 
    });
  }

  // Basic format validation
  const cleanIfsc = String(ifsc).trim().toUpperCase();
  const cleanAccount = String(accountNumber).trim();

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid IFSC Code format. It should be 11 characters (e.g. HDFC0001234).'
    });
  }

  if (!/^\d{9,18}$/.test(cleanAccount)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Account Number. It must be between 9 and 18 digits.'
    });
  }

  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app || app.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    app.bankAccount = {
      accountHolderName: String(accountHolderName).trim(),
      accountNumber: cleanAccount,
      ifsc: cleanIfsc,
      bankName: String(bankName).trim(),
      accountType: accountType === 'CURRENT' ? 'CURRENT' : 'SAVINGS',
      branchName: branchName ? String(branchName).trim() : undefined,
      isVerified: true,
      addedAt: new Date(),
    };
    app.currentStage = 'BANK_ACCOUNT_ADDED';
    await app.save();

    await AuditLog.create({ applicationId: app._id, event: 'BANK_ADDED', performedBy: req.user._id });

    res.json({ success: true, data: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit Declarations
// @route   POST /api/applications/:id/declaration
// @access  Private/Customer
export const submitDeclaration = async (req, res) => {
  const { accepted, version } = req.body;

  if (!accepted) {
    return res.status(400).json({ success: false, message: 'You must accept the terms and declaration to continue.' });
  }

  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app || app.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    app.declaration = { 
      accepted: true, 
      version: version || 'v2026.1', 
      acceptedAt: new Date() 
    };
    app.currentStage = 'DECLARATION_ACCEPTED';
    await app.save();

    await AuditLog.create({ applicationId: app._id, event: 'DECLARATION_ACCEPTED', performedBy: req.user._id });

    res.json({ success: true, data: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Submit Selfie
// @route   POST /api/applications/:id/selfie
// @access  Private/Customer
export const submitSelfie = async (req, res) => {
  const { url, publicId } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Selfie image is required' });
  }

  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app || app.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    app.selfie = { 
      url, 
      publicId: publicId || `selfie_${Date.now()}`, 
      submittedAt: new Date() 
    };
    app.currentStage = 'WAITING_FOR_ADMIN';
    app.status = 'PENDING';
    app.submittedAt = new Date();
    await app.save();

    await AuditLog.create({ applicationId: app._id, event: 'SELFIE_SUBMITTED', performedBy: req.user._id });

    res.json({ success: true, data: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
