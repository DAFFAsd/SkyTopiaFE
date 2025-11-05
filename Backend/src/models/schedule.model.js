const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    curriculum: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' },
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
