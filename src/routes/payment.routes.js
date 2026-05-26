import express from 'express';
import { createPayment, verifyPayment, refundPayment } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { verifyPaymentSchema } from '../validators/payment.validator.js';

const router = express.Router();

// All payment operations are protected by auth
router.use(protect);

router.post('/create', createPayment);
router.post('/verify', validate(verifyPaymentSchema), verifyPayment);

// Admin only: refund payments
router.post('/refund/:orderId', authorize('admin'), refundPayment);

export default router;
