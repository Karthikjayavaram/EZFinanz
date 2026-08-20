import express from 'express';
import {
  getMyApplication,
  getMyApplicationHistory,
  createNewApplication,
  submitKYC,
  checkEligibility,
  previewLoan,
  submitLoanDetails,
  submitBankDetails,
  submitDeclaration,
  submitSelfie,
  updateUserBankAccount
} from '../controllers/applicationController.js';
import { protect, requireCustomer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, requireCustomer, getMyApplication);
router.get('/history', protect, requireCustomer, getMyApplicationHistory);
router.post('/new', protect, requireCustomer, createNewApplication);
router.post('/calculate-loan', protect, requireCustomer, previewLoan);
router.put('/bank-account', protect, requireCustomer, updateUserBankAccount);

router.post('/:id/kyc', protect, requireCustomer, submitKYC);
router.post('/:id/eligibility', protect, requireCustomer, checkEligibility);
router.post('/:id/loan', protect, requireCustomer, submitLoanDetails);
router.post('/:id/bank', protect, requireCustomer, submitBankDetails);
router.post('/:id/declaration', protect, requireCustomer, submitDeclaration);
router.post('/:id/selfie', protect, requireCustomer, submitSelfie);

export default router;
