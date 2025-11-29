const TeacherAttendance = require('../models/attendance.model');

// Teacher clock in (morning attendance)
exports.clockIn = async (req, res) => {
    try {
        const teacherId = req.user.userId;
        const date = new Date();
        const dateOnly = new Date(date);
        dateOnly.setHours(0,0,0,0);

        const { status, note } = req.body;
        const existing = await TeacherAttendance.findOne({ teacher: teacherId, date: dateOnly });
        if (existing?.clockIn?.timestamp) {
            return res.status(400).json({
                success: false,
                message: 'Anda sudah clock in hari ini. Clock in hanya boleh sekali per hari.'
            });
        }

        const attendance = await TeacherAttendance.findOneAndUpdate(
            { teacher: teacherId, date: dateOnly },
            {
                teacher: teacherId,
                date: dateOnly,
                'clockIn.status': status,
                'clockIn.timestamp': date,
                'clockIn.note': note
            },
            { upsert: true, new: true, runValidators: false }
        );

        res.json({ success: true, message: 'Clock in berhasil', attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Teacher clock out (leaving attendance)
exports.clockOut = async (req, res) => {
    try {
        const teacherId = req.user.userId;
        const date = new Date();
        const dateOnly = new Date(date);
        dateOnly.setHours(0,0,0,0);

        const { status, note, leavePhoto } = req.body;
        const existing = await TeacherAttendance.findOne({ teacher: teacherId, date: dateOnly });
        if (!existing || !existing.clockIn?.timestamp) {
            return res.status(400).json({
                success: false,
                message: 'Clock out hanya boleh dilakukan setelah clock in.'
            });
        }

        if (existing.clockOut?.timestamp) {
            return res.status(400).json({
                success: false,
                message: 'Clock out hari ini sudah tercatat.'
            });
        }

        const attendance = await TeacherAttendance.findOneAndUpdate(
            { teacher: teacherId, date: dateOnly },
            {
                'clockOut.status': status,
                'clockOut.timestamp': date,
                'clockOut.note': note,
                'clockOut.leavePhoto': leavePhoto
            },
            { new: true, runValidators: false }
        );

        res.json({ success: true, message: 'Clock out berhasil', attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Teacher marks attendance (legacy - create or update for the date)
exports.markAttendance = async (req, res) => {
    try {
        const teacherId = req.user.userId;
        const date = req.body.date ? new Date(req.body.date) : new Date();
        date.setHours(0,0,0,0);

        const { status, note } = req.body;

        const attendance = await TeacherAttendance.findOneAndUpdate(
            { teacher: teacherId, date },
            {
                'clockIn.status': status || 'Present',
                'clockIn.timestamp': new Date(),
                'clockIn.note': note
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, attendance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Teacher gets their own attendance records
exports.getMyAttendance = async (req, res) => {
    try {
        const teacherId = req.user.userId;
        const records = await TeacherAttendance.find({ teacher: teacherId }).sort({ date: -1 });
        res.json({ success: true, records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: get attendance reports
exports.getAttendance = async (req, res) => {
    try {
        const { teacherId, startDate, endDate, status } = req.query;
        const filter = {};
        if (teacherId) filter.teacher = teacherId;
        if (startDate || endDate) filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate);
        if (endDate) filter.date.$lte = new Date(endDate);
        if (status) filter['clockIn.status'] = status;

        const records = await TeacherAttendance.find(filter).populate('teacher', 'name email');
        res.json({ success: true, records });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: delete attendance record
exports.deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await TeacherAttendance.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ 
                success: false, 
                message: 'Data absensi tidak ditemukan' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Data absensi berhasil dihapus',
            deletedRecord: result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: delete all attendance records (use with caution)
exports.deleteAllAttendance = async (req, res) => {
    try {
        const result = await TeacherAttendance.deleteMany({});
        
        res.json({ 
            success: true, 
            message: `${result.deletedCount} data absensi berhasil dihapus`,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};