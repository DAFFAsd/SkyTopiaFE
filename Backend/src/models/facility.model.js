const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    status: { type: String, enum: ['Available', 'Unavailable', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Facility', facilitySchema);
