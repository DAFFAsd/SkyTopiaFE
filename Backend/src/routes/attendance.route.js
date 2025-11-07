const express = require('express');
const router = express.Router();
const attendanceCtrl = require('../controllers/attendance.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roleCheck');

// Teacher marks attendance
router.post('/', authMiddleware, requireTeacher, attendanceCtrl.markAttendance);

// Admin views attendance records
router.get('/', authMiddleware, requireAdmin, attendanceCtrl.getAttendance);

module.exports = router;
