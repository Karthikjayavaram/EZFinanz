import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    event: {
      type: String,
      required: true,
      enum: [
        'APPLICATION_CREATED',
        'EMAIL_VERIFIED',
        'PHONE_VERIFIED',
        'KYC_COMPLETED',
        'ELIGIBILITY_COMPLETED',
        'LOAN_SELECTED',
        'BANK_ADDED',
        'DECLARATION_ACCEPTED',
        'SELFIE_SUBMITTED',
        'SELFIE_REJECTED',
        'SELFIE_APPROVED',
        'SELFIE_REVIEW_RESET',
        'APPLICATION_APPROVED',
        'APPLICATION_REJECTED',
        'APPLICATION_DECISION_RESET',
        'APPLICATION_STATUS_UPDATED_TO_REJECTED',
        'APPLICATION_STATUS_UPDATED_TO_APPROVED',
        'DISBURSEMENT_CONFIRMED',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
