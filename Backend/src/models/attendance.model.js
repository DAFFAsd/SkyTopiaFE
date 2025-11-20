const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Leave'], default: 'Present' },
    note: { type: String },
    proofImage: { type: String } // URL to uploaded proof image for Leave status
}, { timestamps: true });

attendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', attendanceSchema);
