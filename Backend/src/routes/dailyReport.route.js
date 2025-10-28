const express = require('express');
const router = express.Router();
const dailyReportController = require('../controllers/dailyReport.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher, requireParent } = require('../middleware/roleCheck');

// Teacher only routes
router.post('/', authMiddleware, requireTeacher, dailyReportController.createDailyReport);
router.get('/my-reports', authMiddleware, requireTeacher, dailyReportController.getMyDailyReports);
router.put('/:id', authMiddleware, requireTeacher, dailyReportController.updateDailyReport);
router.delete('/:id', authMiddleware, requireTeacher, dailyReportController.deleteDailyReport);

// Admin only routes
router.get('/', authMiddleware, requireAdmin, dailyReportController.getAllDailyReports);

// Parent only routes
router.get('/my-child-reports', authMiddleware, requireParent, dailyReportController.getMyChildReports);

// Shared route (all authenticated users)
router.get('/:id', authMiddleware, dailyReportController.getDailyReportById);

module.exports = router;