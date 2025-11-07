const express = require('express');
const router = express.Router();
const scheduleCtrl = require('../controllers/schedule.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher, requireAdminOrTeacher } = require('../middleware/roleCheck');

// Admin creates schedules; teachers can view
router.post('/', authMiddleware, requireAdmin, scheduleCtrl.createSchedule);
router.get('/', authMiddleware, requireAdminOrTeacher, scheduleCtrl.getSchedules);
router.put('/:id', authMiddleware, requireAdmin, scheduleCtrl.updateSchedule);
router.delete('/:id', authMiddleware, requireAdmin, scheduleCtrl.deleteSchedule);

module.exports = router;
