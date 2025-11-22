const express = require('express');
const router = express.Router();
const inventoryCtrl = require('../controllers/inventory.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher, requireAdminOrTeacher } = require('../middleware/roleCheck');

// Items - Admin CRUD
router.post('/items', authMiddleware, requireAdmin, inventoryCtrl.createItem);
router.get('/items', authMiddleware, requireAdminOrTeacher, inventoryCtrl.getItems);
router.put('/items/:id', authMiddleware, requireAdmin, inventoryCtrl.updateItem);
router.delete('/items/:id', authMiddleware, requireAdmin, inventoryCtrl.deleteItem);

// Requests - Teacher creates, Admin manages
router.post('/requests', authMiddleware, requireTeacher, inventoryCtrl.requestItem);
router.get('/requests', authMiddleware, requireAdmin, inventoryCtrl.getRequests);
router.get('/my-requests', authMiddleware, requireTeacher, inventoryCtrl.getMyRequests);
router.put('/requests/:id/status', authMiddleware, requireAdmin, inventoryCtrl.updateRequestStatus);

// Received Items - Teacher/Admin records, Admin views all
router.post('/received', authMiddleware, requireAdminOrTeacher, inventoryCtrl.recordReceivedItem);
router.get('/received', authMiddleware, requireAdminOrTeacher, inventoryCtrl.getReceivedItems);

module.exports = router;
