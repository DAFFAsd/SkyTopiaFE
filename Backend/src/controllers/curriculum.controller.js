const Curriculum = require('../models/curriculum.model');

exports.createCurriculum = async (req, res) => {
    try {
        const cur = await Curriculum.create({ ...req.body, createdBy: req.user.userId });
        res.status(201).json({ success: true, curriculum: cur });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getCurriculums = async (req, res) => {
    try {
        const cur = await Curriculum.find();
        res.json({ success: true, curriculums: cur });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateCurriculum = async (req, res) => {
    try {
        const cur = await Curriculum.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!cur) return res.status(404).json({ success: false, message: 'Curriculum not found' });
        res.json({ success: true, curriculum: cur });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteCurriculum = async (req, res) => {
    try {
        const cur = await Curriculum.findByIdAndDelete(req.params.id);
        if (!cur) return res.status(404).json({ success: false, message: 'Curriculum not found' });
        res.json({ success: true, message: 'Curriculum deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
