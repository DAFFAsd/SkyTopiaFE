const Payment = require('../models/payment.model');
const Child = require('../models/child.model');
const { calculateManualDueDate, checkAndUpdateOverdue } = require('../tasks/scheduler');
const cloudinary = require('../config/cloudinary');

// Create new payment - Admin only (manual creation)
exports.createPayment = async (req, res) => {
    try {
        const { child_id, due_date, category, period } = req.body;

        // Verify that child exists
        const child = await Child.findById(child_id);
        if (!child) {
            return res.status(400).json({ success: false, message: "Child not found" });
        }

        // Determine amount automatically based on category
        let amount = 0;
        switch (category) {
            case 'Bulanan':
                amount = child.monthly_fee; // Use monthly fee from child record
                break;
            case 'Semester':
                amount = child.semester_fee; // Use semester fee from child record
                break;
            case 'Registrasi':
                if (!req.body.amount || req.body.amount <= 0) {
                    return res.status(400).json({ success: false, message: "Amount is required for registration payments" });
                }
                amount = req.body.amount;
                break;
        }

        // Validate that a valid amount was determined
        if (amount <= 0) {
            return res.status(400).json({ success: false, message: `No ${category} fee set for this child` });
        }

        // Validate category is one of the allowed values
        const validCategories = ["Bulanan", "Semester", "Registrasi"];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({ success: false, message: "Invalid category" });
        }

        // Validate period requirements based on category
        if (category === 'Semester' && !period) {
            return res.status(400).json({ success: false, message: "Period is required for semester payments" });
        }
        if (category === 'Bulanan' && !period) {
            return res.status(400).json({ success: false, message: "Period is required for monthly payments" });
        }

        // Calculate due date
        const finalDueDate = due_date ? new Date(due_date) : calculateManualDueDate(category);

        // Validate due date is in the future if provided manually
        if (due_date && finalDueDate <= new Date()) {
            return res.status(400).json({ success: false, message: "Due date must be in the future" });
        }

        // Check for duplicate payments in the same period
        if (period) {
            const existingPayment = await Payment.findOne({ child_id, period, category });
            if (existingPayment) {
                return res.status(400).json({
                    success: false,
                    message: `Payment for ${category} period ${period} already exists`
                });
            }
        }

        // Create the payment record
        const payment = await Payment.create({
            child_id,
            amount,
            due_date: finalDueDate,
            category: category,
            period,
            status: "Tertunda"
        });

        // Return payment data with child information
        const populatedPayment = await Payment.findById(payment._id)
            .populate('child_id', 'name birth_date gender monthly_fee semester_fee');

        res.status(201).json({ success: true, message: "Payment created successfully", payment: populatedPayment });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all payments - Admin only
exports.getAllPayments = async (req, res) => {
    try {
        // Auto check overdue before fetching data
        await checkAndUpdateOverdue();

        const { status, category, child_id, page = 1, limit = 10 } = req.query;
        const filter = {};

        // Apply filters (if provided)
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (child_id) filter.child_id = child_id;

        const payments = await Payment.find(filter)
            .populate('child_id', 'name birth_date gender')
            .sort({ due_date: 1 })    // ascending
            .skip((page - 1) * limit) // skip previous page
            .limit(parseInt(limit));  // get max 10 datas after skip

        const total = await Payment.countDocuments(filter);

        res.json({
            success: true,
            payments,
            pagination: {
                page: parseInt(page),    // current page
                limit: parseInt(limit),  // data per page
                total,                   // total data
                pages: Math.ceil(total / limit)  // total pages
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get payments by child ID - Admin only
exports.getPaymentsByChildId = async (req, res) => {
    try {
        const { childId } = req.params;

        // Auto check overdue before fetching data
        await checkAndUpdateOverdue();

        // Verify that child exists
        const child = await Child.findById(childId);
        if (!child) {
            return res.status(400).json({ success: false, message: "Child not found" });
        }

        // Find all payments for the specified child
        const payments = await Payment.find({ child_id: childId })
            .populate('child_id', 'name birth_date gender')
            .sort({ due_date: 1 });

        res.json({ success: true, payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get my child payments - Parent only
exports.getMyChildPayments = async (req, res) => {
    try {
        // Auto check overdue before fetching data
        await checkAndUpdateOverdue();

        // Find all children belonging to the parent
        const myChildren = await Child.find({ parent_id: req.user.userId });
        const childIds = myChildren.map(child => child._id);

        // Find payments for the parent's children
        const payments = await Payment.find({ child_id: { $in: childIds } })
            .populate('child_id', 'name birth_date gender')
            .sort({ due_date: 1 });

        res.json({ success: true, payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get payment by ID - Admin (all payments), Parent (own child only)
exports.getPaymentById = async (req, res) => {
    try {
        // Auto check overdue before fetching data
        await checkAndUpdateOverdue();

        // Find payment by ID with populated child data
        const payment = await Payment.findById(req.params.id)
            .populate('child_id', 'name birth_date gender parent_id');

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        // Check if parent is accessing payment for their own child
        if (req.user.role === 'Parent') {
            if (payment.child_id.parent_id.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }
        }

        res.json({ success: true, payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Submit proof of payment - Parent only (for their own child)
exports.submitProofOfPayment = async (req, res) => {
    try {     
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Proof of payment image is required" });
        }

        // Find payment first
        const payment = await Payment.findById(req.params.id)
            .populate('child_id', 'name birth_date gender parent_id');

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        // Check if payment is already paid
        if (payment.status === 'Dibayar') {
            return res.status(400).json({
                success: false,
                message: `Cannot submit proof for payment with ${payment.status} status`
            });
        }

        // Check if parent is submitting proof for their own child
        if (req.user.role === 'Parent') {
            if (payment.child_id.parent_id.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }
        }

        // Manual upload to Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: "proof-of-payments",
            resource_type: "image"
        });

        const proof_of_payment_url = uploadResult.secure_url;

        // Update payment dengan proof dan change status to Submitted
        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            {
                proof_of_payment_url,
                status: "Terkirim"
            },
            { new: true, runValidators: true }
        ).populate('child_id', 'name birth_date gender');

        res.json({
            success: true,
            message: "Proof of payment submitted successfully",
            payment: updatedPayment 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update payment status - Admin only
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { status, rejection_reason } = req.body;

        // Validate status
        const validStatuses = ["Tertunda", "Terkirim", "Dibayar", "Ditolak", "Jatuh Tempo"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be one of: " + validStatuses.join(", ")
            });
        }

        // If status is rejected, give the reason
        if (status === "Ditolak" && !rejection_reason) {
            return res.status(400).json({ success: false, message: "Rejection reason is required when rejecting payment" });
        }

        // Find and update payment
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            {
                status,
                // If status is paid, set paid_at dan clear rejection reason
                ...(status === "Dibayar" && {
                    paid_at: new Date(),
                    rejection_reason: null
                }),
                // If status is rejected, set rejection_reason
                ...(status === "Ditolak" && {
                    rejection_reason: rejection_reason
                }),
                // If status is neither paid nor rejected, clear data
                ...(!["Dibayar", "Ditolak"].includes(status) && {
                    paid_at: null,
                    rejection_reason: null
                })
            },
            { new: true, runValidators: true }
        ).populate('child_id', 'name birth_date gender');

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        res.json({ success: true, message: "Payment status updated successfully", payment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete payment - Admin only
exports.deletePayment = async (req, res) => {
    try {
        // Find payment first to check status
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        // Prevent deletion of paid payments
        if (payment.status === 'Dibayar') {
            return res.status(400).json({ success: false, message: "Cannot delete paid payments" });
        }

        // Delete the payment
        await Payment.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Payment deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};