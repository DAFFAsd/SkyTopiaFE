const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    theme: { type: String },
    sub_theme: { type: String },
    physical_motor: { type: String },
    cognitive: { type: String },
    social_emotional: { type: String },
    meals: {
        snack: { type: String },
        lunch: { type: String }
    },
    nap_duration: { type: String },
    special_notes: { type: String },
}, { timestamps: true });

const DailyReport = mongoose.model("DailyReport", dailyReportSchema);
module.exports = DailyReport;