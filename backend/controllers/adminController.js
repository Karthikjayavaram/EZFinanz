import LoanApplication from '../models/LoanApplication.js';
import AuditLog from '../models/AuditLog.js';
import { sendLoanApprovalEmail, sendLoanRejectionEmail } from '../services/emailNotificationService.js';

// @desc    Get all applications
// @route   GET /api/admin/applications
// @access  Private/Admin
export const getApplications = async (req, res) => {
  try {
    const applications = await LoanApplication.find({}).populate('userId', 'name email phone').sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get application by ID
// @route   GET /api/admin/applications/:id
// @access  Private/Admin
export const getApplicationById = async (req, res) => {
  try {
    const application = await LoanApplication.findById(req.params.id).populate('userId', 'name email phone');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve/Reject/Reset Selfie Review
// @route   POST /api/admin/applications/:id/selfie-review
// @access  Private/Admin
export const reviewSelfie = async (req, res) => {
  const { status, reason } = req.body;
  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (app.status === 'DISBURSED') {
      return res.status(400).json({ success: false, message: 'Cannot edit verification for an already disbursed loan' });
    }

    const previousStatus = app.adminReview?.selfieStatus;
    app.adminReview = {
      ...app.adminReview,
      reviewedBy: req.user._id,
      selfieStatus: status,
      selfieRejectionReason: status === 'REJECTED' ? reason : '',
    };

    if (status === 'REJECTED') {
      app.currentStage = 'SELFIE_REJECTED';
      // If loan was already approved, revert it back to pending since selfie is now rejected
      if (app.status === 'APPROVED') {
        app.status = 'PENDING';
      }
      await AuditLog.create({ applicationId: app._id, event: 'SELFIE_REJECTED', performedBy: req.user._id, metadata: { reason, previousStatus } });
    } else if (status === 'APPROVED') {
      if (app.currentStage === 'SELFIE_REJECTED') {
        app.currentStage = 'SELFIE_SUBMITTED';
      }
      await AuditLog.create({ applicationId: app._id, event: 'SELFIE_APPROVED', performedBy: req.user._id, metadata: { previousStatus } });
    } else {
      // PENDING / RESET
      app.adminReview.selfieStatus = 'PENDING';
      app.adminReview.selfieRejectionReason = '';
      app.currentStage = 'SELFIE_SUBMITTED';
      if (app.status === 'APPROVED') {
        app.status = 'PENDING';
      }
      await AuditLog.create({ applicationId: app._id, event: 'SELFIE_REVIEW_RESET', performedBy: req.user._id });
    }

    await app.save();
    res.json({ success: true, data: app });
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Approve / Sanction Application (or update to Approved)
// @route   POST /api/admin/applications/:id/approve
// @access  Private/Admin
export const approveApplication = async (req, res) => {
  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (app.status === 'DISBURSED') {
      return res.status(400).json({ success: false, message: 'Cannot edit an already disbursed loan' });
    }

    // 1. KYC is completed
    const hasKyc = !!(app.kyc?.completedAt || (app.kyc?.fullName && app.kyc?.idNumber));
    if (!hasKyc) {
      return res.status(400).json({ success: false, message: 'Cannot approve: KYC details are incomplete' });
    }

    // 2. Eligibility has been calculated
    const hasEligibility = !!(app.eligibility?.calculatedAt || app.eligibility?.status);
    if (!hasEligibility) {
      return res.status(400).json({ success: false, message: 'Cannot approve: Eligibility assessment has not been completed' });
    }

    // 3. Loan/EMI details have been selected
    const hasLoanDetails = !!(app.loanDetails?.amount && app.loanDetails?.tenure && app.loanDetails?.emi);
    if (!hasLoanDetails) {
      return res.status(400).json({ success: false, message: 'Cannot approve: Loan and EMI terms have not been selected' });
    }

    // 4. Bank account details are present
    const hasBankAccount = !!(app.bankAccount?.accountNumber && app.bankAccount?.ifsc);
    if (!hasBankAccount) {
      return res.status(400).json({ success: false, message: 'Cannot approve: Bank account details are missing' });
    }

    // 5. Declaration has been accepted
    if (!app.declaration?.accepted) {
      return res.status(400).json({ success: false, message: 'Cannot approve: Borrower declaration has not been accepted' });
    }

    // 6. Selfie has been submitted
    if (!app.selfie?.url) {
      return res.status(400).json({ success: false, message: 'Cannot approve: Verification selfie has not been submitted' });
    }

    // 7. Selfie check: If selfie was explicitly rejected, alert admin. If pending, auto-approve upon sanction.
    if (app.adminReview?.selfieStatus === 'REJECTED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot approve: Verification photo is currently marked as Rejected. Please approve the photo first.' 
      });
    }

    const previousStatus = app.status;
    app.status = 'APPROVED';
    app.currentStage = 'APPLICATION_APPROVED';
    app.approvedAt = new Date();
    app.rejectedAt = null;
    app.adminReview = {
      ...app.adminReview,
      selfieStatus: 'APPROVED',
      selfieRejectionReason: '',
      applicationRejectionReason: '',
      reviewedBy: req.user._id
    };
    await app.save();

    await AuditLog.create({ 
      applicationId: app._id, 
      event: previousStatus === 'REJECTED' ? 'APPLICATION_STATUS_UPDATED_TO_APPROVED' : 'APPLICATION_APPROVED', 
      performedBy: req.user._id 
    });

    // Send email notification to customer asynchronously
    try {
      const populatedApp = await LoanApplication.findById(app._id).populate('userId', 'name email');
      if (populatedApp?.userId?.email) {
        sendLoanApprovalEmail({
          toEmail: populatedApp.userId.email,
          recipientName: populatedApp.kyc?.fullName || populatedApp.userId.name,
          applicationNumber: app.applicationNumber,
          loanAmount: app.loanDetails?.amount,
          tenure: app.loanDetails?.tenure,
          emi: app.loanDetails?.emi
        }).catch((err) => console.error('Approval email dispatch failed:', err.message));
      }
    } catch (emailErr) {
      console.warn('Could not populate user for email notification:', emailErr.message);
    }

    res.json({ success: true, data: app });
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Reject Application (or update to Rejected)
// @route   POST /api/admin/applications/:id/reject
// @access  Private/Admin
export const rejectApplication = async (req, res) => {
  const { reason } = req.body;
  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (app.status === 'DISBURSED') {
      return res.status(400).json({ success: false, message: 'Cannot reject an already disbursed loan' });
    }

    const previousStatus = app.status;
    app.status = 'REJECTED';
    app.currentStage = 'APPLICATION_REJECTED';
    app.rejectedAt = new Date();
    app.approvedAt = null;
    app.adminReview = { 
      ...app.adminReview, 
      applicationRejectionReason: reason || 'Application rejected by credit administrator', 
      reviewedBy: req.user._id 
    };
    await app.save();

    await AuditLog.create({ 
      applicationId: app._id, 
      event: previousStatus === 'APPROVED' ? 'APPLICATION_STATUS_UPDATED_TO_REJECTED' : 'APPLICATION_REJECTED', 
      performedBy: req.user._id, 
      metadata: { reason, previousStatus } 
    });

    // Send email notification to customer asynchronously
    try {
      const populatedApp = await LoanApplication.findById(app._id).populate('userId', 'name email');
      if (populatedApp?.userId?.email) {
        sendLoanRejectionEmail({
          toEmail: populatedApp.userId.email,
          recipientName: populatedApp.kyc?.fullName || populatedApp.userId.name,
          applicationNumber: app.applicationNumber
        }).catch((err) => console.error('Rejection email dispatch failed:', err.message));
      }
    } catch (emailErr) {
      console.warn('Could not populate user for email notification:', emailErr.message);
    }

    res.json({ success: true, data: app });
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Reset Application Decision back to Under Review
// @route   POST /api/admin/applications/:id/reset-decision
// @access  Private/Admin
export const resetApplicationDecision = async (req, res) => {
  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (app.status === 'DISBURSED') {
      return res.status(400).json({ success: false, message: 'Cannot reset an already disbursed loan' });
    }

    const previousStatus = app.status;
    app.status = 'PENDING';
    app.currentStage = app.selfie?.url ? 'SELFIE_SUBMITTED' : 'REGISTERED';
    app.approvedAt = null;
    app.rejectedAt = null;
    app.adminReview = {
      ...app.adminReview,
      applicationRejectionReason: ''
    };
    await app.save();

    await AuditLog.create({ 
      applicationId: app._id, 
      event: 'APPLICATION_DECISION_RESET', 
      performedBy: req.user._id, 
      metadata: { previousStatus } 
    });

    res.json({ success: true, data: app });
  } catch (error) {
    console.error('Admin controller error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Disburse Loan
// @route   POST /api/admin/applications/:id/disburse
// @access  Private/Admin
export const disburseLoan = async (req, res) => {
  try {
    const app = await LoanApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (app.status === 'DISBURSED') {
      return res.status(400).json({ success: false, message: 'Cannot disburse: Loan has already been disbursed' });
    }

    if (app.status !== 'APPROVED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot disburse: Loan application must be APPROVED prior to fund disbursement' 
      });
    }

    app.status = 'DISBURSED';
    app.currentStage = 'DISBURSEMENT_CONFIRMED';
    app.disbursedAt = new Date();
    app.disbursementReference = `EZFDISB-${Math.floor(10000000 + Math.random() * 90000000)}`;
    await app.save();

    await AuditLog.create({ applicationId: app._id, event: 'DISBURSEMENT_CONFIRMED', performedBy: req.user._id, metadata: { reference: app.disbursementReference } });

    res.json({ success: true, data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
