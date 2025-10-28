const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

// Public routes
router.post('/login', userController.login);

// Admin only routes
router.post('/register', authMiddleware, requireAdmin, userController.register);
router.get('/', authMiddleware, requireAdmin, userController.getAllUsers);
router.get('/:id', authMiddleware, requireAdmin, userController.getUserById);
router.put('/:id', authMiddleware, requireAdmin, userController.updateUser);
router.delete('/:id', authMiddleware, requireAdmin, userController.deleteUser);

// Protected routes (all authenticated users)
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;