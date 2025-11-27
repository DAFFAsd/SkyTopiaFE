const TeacherAttendance = require('../models/attendance.model');

// Teacher marks attendance (create or update for the date)
exports.markAttendance = async (req, res) => {
    try {
        const teacherId = req.user.userId;
        const date = req.body.date ? new Date(req.body.date) : new Date();
        date.setHours(0,0,0,0);

        const payload = { teacher: teacherId, date, status: req.body.status || 'Present', note: req.body.note };
        
        // Add proof image if provided
        if (req.body.proofImage) {
            payload.proofImage = req.body.proofImage;
        }

        const attendance = await TeacherAttendance.findOneAndUpdate(
            { teacher: teacherId, date },
            payload,
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: get attendance reports
exports.getAttendance = async (req, res) => {
    try {
        const { teacherId, startDate, endDate } = req.query;
        const filter = {};
        if (teacherId) filter.teacher = teacherId;
        if (startDate || endDate) filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);

        const records = await TeacherAttendance.find(filter).populate('teacher', 'name email');
        res.json({ success: true, records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
