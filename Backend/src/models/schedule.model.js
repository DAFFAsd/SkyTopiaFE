const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    curriculum: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' },
    date: { type: Date, required: true },
    day: { type: String }, // Will be computed from date (Monday, Tuesday, etc.)
    startTime: { type: String },
    endTime: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
