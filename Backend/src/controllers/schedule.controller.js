const Schedule = require('../models/schedule.model');

exports.createSchedule = async (req, res) => {
    try {
        const s = await Schedule.create(req.body);
        res.status(201).json({ success: true, schedule: s });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find().populate('curriculum teacher', 'title name');
        res.json({ success: true, schedules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const s = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!s) return res.status(404).json({ success: false, message: 'Schedule not found' });
        res.json({ success: true, schedule: s });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const s = await Schedule.findByIdAndDelete(req.params.id);
        if (!s) return res.status(404).json({ success: false, message: 'Schedule not found' });
        res.json({ success: true, message: 'Schedule deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
