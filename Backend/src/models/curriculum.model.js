const mongoose = require('mongoose');

const curriculumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    grade: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Curriculum', curriculumSchema);
