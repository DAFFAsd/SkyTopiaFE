const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireAnyRole } = require('../middleware/roleCheck');

// Public routes
router.post('/login', userController.login);
router.post('/setup-admin', userController.setupAdmin);

// Protected routes (all authenticated users)
router.get('/profile', authMiddleware, requireAnyRole, userController.getProfile);

// Admin only routes
router.get('/dashboard/stats', authMiddleware, requireAdmin, userController.getDashboardStats);
router.post('/register', authMiddleware, requireAdmin, userController.register);
router.get('/', authMiddleware, requireAdmin, userController.getAllUsers);
router.get('/:id', authMiddleware, requireAdmin, userController.getUserById);
router.put('/:id', authMiddleware, requireAdmin, userController.updateUser);
router.delete('/:id', authMiddleware, requireAdmin, userController.deleteUser);

module.exports = router;