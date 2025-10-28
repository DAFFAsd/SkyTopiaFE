const express = require('express');
const router = express.Router();
const monthlyReportController = require('../controllers/monthlyReport.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher, requireParent } = require('../middleware/roleCheck');

// Teacher only routes
router.post('/', authMiddleware, requireTeacher, monthlyReportController.createMonthlyReport);
router.get('/my-reports', authMiddleware, requireTeacher, monthlyReportController.getMyMonthlyReports);
router.patch('/:id/partial', authMiddleware, requireTeacher, monthlyReportController.partialUpdateMonthlyReport); // NEW
router.put('/:id', authMiddleware, requireTeacher, monthlyReportController.updateMonthlyReport);
router.delete('/:id', authMiddleware, requireTeacher, monthlyReportController.deleteMonthlyReport);

// Admin only routes  
router.get('/', authMiddleware, requireAdmin, monthlyReportController.getAllMonthlyReports);

// Parent only routes
router.get('/my-child-reports', authMiddleware, requireParent, monthlyReportController.getMyChildMonthlyReports);

// Shared route (all authenticated users)
router.get('/:id', authMiddleware, monthlyReportController.getMonthlyReportById);

module.exports = router;