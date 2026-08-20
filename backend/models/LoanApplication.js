import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    currentStage: {
      type: String,
      enum: [
        'REGISTERED',
        'EMAIL_VERIFIED',
        'PHONE_VERIFIED',
        'KYC_COMPLETED',
        'ELIGIBILITY_COMPLETED',
        'EMI_SELECTED',
        'BANK_ACCOUNT_ADDED',
        'DECLARATION_ACCEPTED',
        'SELFIE_SUBMITTED',
        'WAITING_FOR_ADMIN',
        'SELFIE_REJECTED',
        'APPLICATION_APPROVED',
        'APPLICATION_REJECTED',
        'DISBURSEMENT_CONFIRMED',
      ],
      default: 'REGISTERED',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'DISBURSED'],
      default: 'DRAFT',
    },
    loanType: {
      type: String,
      default: 'Personal Loan',
    },
    
    // KYC Data
    kyc: {
      fullName: String,
      dob: Date,
      gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
      address: String,
      idType: { type: String, enum: ['PAN', 'AADHAAR', 'OTHER'] },
      idNumber: String,
      idDocumentUrl: String,
      idDocumentPublicId: String,
      completedAt: Date,
    },

    // Eligibility Data
    eligibility: {
      incomeType: { type: String, enum: ['MONTHLY', 'ANNUAL'] },
      monthlyIncome: Number,
      annualIncome: Number,
      requestedLoanAmount: Number,
      creditScore: Number,
      monthlyDebt: Number,
      dti: Number,
      employerName: String,
      designation: String,
      creditRating: String,
      maxEligibleAmount: Number,
      applicableInterestRate: Number,
      status: { type: String, enum: ['ELIGIBLE', 'PARTIALLY_ELIGIBLE', 'NOT_ELIGIBLE'] },
      reasons: [String],
      calculatedAt: Date,
    },

    // Loan Selection & Calculations
    loanDetails: {
      amount: Number,
      tenure: Number, // in months
      interestRate: Number,
      emi: Number,
      totalInterest: Number,
      totalRepayment: Number,
      processingFee: Number,
      gst: Number,
      otherCharges: Number,
      totalCharges: Number,
      netDisbursement: Number,
      irr: Number,
      selectedAt: Date,
    },

    // Bank Account
    bankAccount: {
      accountHolderName: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
      accountType: { type: String, enum: ['SAVINGS', 'CURRENT'], default: 'SAVINGS' },
      branchName: String,
      isVerified: { type: Boolean, default: true },
      addedAt: Date,
    },

    // Declaration
    declaration: {
      accepted: Boolean,
      version: String,
      acceptedAt: Date,
    },

    // Selfie
    selfie: {
      url: String,
      publicId: String,
      submittedAt: Date,
    },

    // Admin Review
    adminReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      selfieStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] },
      selfieRejectionReason: String,
      applicationRejectionReason: String,
    },

    submittedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    disbursedAt: Date,
    disbursementReference: String,
  },
  {
    timestamps: true,
  }
);

const LoanApplication = mongoose.model('LoanApplication', applicationSchema);
export default LoanApplication;
