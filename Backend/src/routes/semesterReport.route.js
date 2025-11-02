const express = require('express');
const router = express.Router();
const semesterReportController = require('../controllers/semesterReport.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher, requireParent, requireAnyRole } = require('../middleware/roleCheck');

// Teacher only routes
router.post('/', authMiddleware, requireTeacher, semesterReportController.createSemesterReport);
router.get('/my-reports', authMiddleware, requireTeacher, semesterReportController.getMySemesterReports);
router.patch('/:id/partial', authMiddleware, requireTeacher, semesterReportController.partialUpdateSemesterReport); // NEW
router.put('/:id', authMiddleware, requireTeacher, semesterReportController.updateSemesterReport);
router.delete('/:id', authMiddleware, requireTeacher, semesterReportController.deleteSemesterReport);

// Admin only routes  
router.get('/', authMiddleware, requireAdmin, semesterReportController.getAllSemesterReports);

// Parent only routes
router.get('/my-child-reports', authMiddleware, requireParent, semesterReportController.getMyChildSemesterReports);

// Shared route (all authenticated users)
router.get('/:id', authMiddleware, requireAnyRole, semesterReportController.getSemesterReportById);

module.exports = router;