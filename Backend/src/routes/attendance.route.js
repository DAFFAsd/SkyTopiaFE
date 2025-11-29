const express = require('express');
const router = express.Router();
const attendanceCtrl = require('../controllers/attendance.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roleCheck');

// Teacher clock in (morning)
router.post('/clock-in', authMiddleware, requireTeacher, attendanceCtrl.clockIn);

// Teacher clock out (leaving)
router.post('/clock-out', authMiddleware, requireTeacher, attendanceCtrl.clockOut);

// Teacher marks attendance (legacy)
router.post('/', authMiddleware, requireTeacher, attendanceCtrl.markAttendance);

// Teacher gets their own attendance history
router.get('/my-records', authMiddleware, requireTeacher, attendanceCtrl.getMyAttendance);

// Admin views all attendance records
router.get('/', authMiddleware, requireAdmin, attendanceCtrl.getAttendance);

// Admin deletes specific attendance record
router.delete('/:id', authMiddleware, requireAdmin, attendanceCtrl.deleteAttendance);

// Admin deletes all attendance records
router.delete('/', authMiddleware, requireAdmin, attendanceCtrl.deleteAllAttendance);

module.exports = router;
