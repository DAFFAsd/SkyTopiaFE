const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireParent } = require('../middleware/roleCheck');

// Admin only routes
router.post('/', authMiddleware, requireAdmin, paymentController.createPayment);
router.get('/', authMiddleware, requireAdmin, paymentController.getAllPayments);
router.get('/child/:childId', authMiddleware, requireAdmin, paymentController.getPaymentsByChildId);
router.put('/:id/status', authMiddleware, requireAdmin, paymentController.updatePaymentStatus);
router.delete('/:id', authMiddleware, requireAdmin, paymentController.deletePayment);

// Parent only routes
router.get('/my-payments', authMiddleware, requireParent, paymentController.getMyChildPayments);
router.put('/:id/submit-proof', authMiddleware, requireParent, paymentController.submitProofOfPayment);

// Shared route (Admin and Parent with ownership check)
router.get('/:id', authMiddleware, paymentController.getPaymentById);

module.exports = router;