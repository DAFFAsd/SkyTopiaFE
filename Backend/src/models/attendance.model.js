const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    clockIn: {
        status: { type: String, enum: ['Present', 'Absent', 'Leave'], default: 'Present' },
        timestamp: { type: Date },
        note: { type: String }
    },
    clockOut: {
        status: { type: String, enum: ['Present', 'Absent', 'Leave'] },
        timestamp: { type: Date },
        note: { type: String },
        leavePhoto: { type: String } // URL photo for leave status
    }
}, { timestamps: true });

attendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', attendanceSchema);
