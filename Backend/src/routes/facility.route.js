const express = require('express');
const router = express.Router();
const facilityCtrl = require('../controllers/facility.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher, requireAdminOrTeacher } = require('../middleware/roleCheck');

// Admin: manage facilities
router.post('/', authMiddleware, requireAdmin, facilityCtrl.createFacility);
router.get('/', authMiddleware, requireAdminOrTeacher, facilityCtrl.getFacilities);
router.get('/:id', authMiddleware, requireAdminOrTeacher, facilityCtrl.getFacilityById);
router.put('/:id', authMiddleware, requireAdmin, facilityCtrl.updateFacility);
router.delete('/:id', authMiddleware, requireAdmin, facilityCtrl.deleteFacility);

// Report condition (teacher or admin)
router.post('/:id/conditions', authMiddleware, requireAdminOrTeacher, facilityCtrl.reportCondition);
router.get('/conditions/all', authMiddleware, requireAdminOrTeacher, facilityCtrl.getConditions);
router.put('/conditions/:id/status', authMiddleware, requireAdmin, facilityCtrl.updateConditionStatus);

module.exports = router;
