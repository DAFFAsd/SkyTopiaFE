const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, required: true },
    images: [{ type: String }],
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('FacilityCondition', conditionSchema);
