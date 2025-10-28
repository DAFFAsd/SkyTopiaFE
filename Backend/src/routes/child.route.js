const express = require('express');
const router = express.Router();
const childController = require('../controllers/child.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireParent } = require('../middleware/roleCheck');

// Admin only routes
router.post('/', authMiddleware, requireAdmin, childController.createChild);
router.get('/', authMiddleware, requireAdmin, childController.getAllChildren);
router.put('/:id', authMiddleware, requireAdmin, childController.updateChild);
router.delete('/:id', authMiddleware, requireAdmin, childController.deleteChild);

// Parent routes  
router.get('/my-children', authMiddleware, requireParent, childController.getMyChildren);

// Shared route (all authenticated users)
router.get('/:id', authMiddleware, childController.getChildById);

module.exports = router;