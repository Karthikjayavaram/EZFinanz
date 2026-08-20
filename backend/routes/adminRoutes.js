import express from 'express';
import {
  getApplications,
  getApplicationById,
  reviewSelfie,
  approveApplication,
  rejectApplication,
  resetApplicationDecision,
  disburseLoan,
} from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/applications')
  .get(protect, requireAdmin, getApplications);

router.route('/applications/:id')
  .get(protect, requireAdmin, getApplicationById);

router.post('/applications/:id/selfie-review', protect, requireAdmin, reviewSelfie);
router.post('/applications/:id/approve', protect, requireAdmin, approveApplication);
router.post('/applications/:id/reject', protect, requireAdmin, rejectApplication);
router.post('/applications/:id/reset-decision', protect, requireAdmin, resetApplicationDecision);
router.post('/applications/:id/disburse', protect, requireAdmin, disburseLoan);

export default router;
