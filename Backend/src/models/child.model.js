const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
    name: { type: String, required: true },
    birth_date: { type: Date, required: true },
    gender: { type: String, enum: ["Laki-laki", "Perempuan"], required: true },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    medical_notes: { type: String },
    monthly_fee: { type: Number, default: 0 },
    semester_fee: { type: Number, default: 0 },
}, { timestamps: true });

const Child = mongoose.model("Child", childSchema);
module.exports = Child;