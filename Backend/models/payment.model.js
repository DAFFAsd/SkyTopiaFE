const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    amount: { type: Number, required: true },
    proof_of_payment_url: { type: String },
    status: { type: String, enum: ["Pending", "Submitted", "Paid", "Rejected", "Overdue"], default: "Pending" },
    due_date: { type: Date },
    paid_at: { type: Date },
    
    category: { 
        type: String, 
        enum: ["Monthly", "Semester", "Registration"], 
        required: true,
        default: "Monthly" 
    },
    
    period: { type: String }, // Format: "2025-01" for monthly, "2025-1" for semester
    
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;