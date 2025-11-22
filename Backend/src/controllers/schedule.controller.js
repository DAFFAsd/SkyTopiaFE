const Schedule = require('../models/schedule.model');

exports.createSchedule = async (req, res) => {
    try {
        // Ensure date is properly formatted as a Date object
        const scheduleData = {
            ...req.body,
            date: req.body.date ? new Date(req.body.date) : new Date()
        };
        const s = await Schedule.create(scheduleData);
        res.status(201).json({ success: true, schedule: s });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find()
            .populate('curriculum', 'title')
            .populate('teacher', 'name email');
        res.json({ success: true, schedules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const scheduleData = {
            ...req.body,
            date: req.body.date ? new Date(req.body.date) : undefined
        };
        // Remove undefined date if not provided
        if (scheduleData.date === undefined) {
            delete scheduleData.date;
        }
        const s = await Schedule.findByIdAndUpdate(req.params.id, scheduleData, { new: true, runValidators: true });
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
