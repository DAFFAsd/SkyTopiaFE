const express = require('express');
const router = express.Router();
const curriculumCtrl = require('../controllers/curriculum.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireAdmin, requireTeacher, requireAdminOrTeacher } = require('../middleware/roleCheck');

// Admin: manage curriculum
router.post('/', authMiddleware, requireAdmin, curriculumCtrl.createCurriculum);
router.get('/', authMiddleware, requireAdminOrTeacher, curriculumCtrl.getCurriculums);
router.put('/:id', authMiddleware, requireAdmin, curriculumCtrl.updateCurriculum);
router.delete('/:id', authMiddleware, requireAdmin, curriculumCtrl.deleteCurriculum);

module.exports = router;
