const express = require('express');
const multer = require('multer');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireParent } = require('../middleware/roleCheck');

// Setup multer memory storage
const storage = multer.memoryStorage();

// Configure multer for file upload handling
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Validate file type - only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Admin only routes
router.post('/', authMiddleware, requireAdmin, paymentController.createPayment);
router.get('/', authMiddleware, requireAdmin, paymentController.getAllPayments);
router.get('/child/:childId', authMiddleware, requireAdmin, paymentController.getPaymentsByChildId);
router.put('/:id/status', authMiddleware, requireAdmin, paymentController.updatePaymentStatus);
router.delete('/:id', authMiddleware, requireAdmin, paymentController.deletePayment);

// Parent only routes
router.get('/my-payments', authMiddleware, requireParent, paymentController.getMyChildPayments);
router.put('/:id/submit-proof', authMiddleware, requireParent, upload.single('proof_file'), paymentController.submitProofOfPayment); // ✅ LANGSUNG DI ROUTE

// Shared route
router.get('/:id', authMiddleware, paymentController.getPaymentById);

module.exports = router;