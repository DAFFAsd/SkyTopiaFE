const Child = require('../models/child.model');
const User = require('../models/user.model');

// Create new child - Admin only
exports.createChild = async (req, res) => {
    try {
        const { name, birth_date, gender, parent_id, medical_notes, monthly_fee, semester_fee } = req.body;
        
        // Verify that parent_id exists and is a Parent role
        const parent = await User.findById(parent_id);
        if (!parent || parent.role !== 'Parent') {
            return res.status(400).json({ success: false, message: "Invalid parent ID or user is not a parent" });
        }

        // Create new child in database (INCLUDING new fee fields)
        const child = await Child.create({ 
            name, 
            birth_date, 
            gender, 
            parent_id, 
            medical_notes,
            monthly_fee,
            semester_fee
        });

        // Populate parent information for response
        const populatedChild = await Child.findById(child._id).populate('parent_id', 'name email phone');
        
        res.status(201).json({ 
            success: true, 
            message: "Child created successfully", 
            child: populatedChild 
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all children - Admin only
exports.getAllChildren = async (req, res) => {
    try {
        // Find all children and populate parent information
        const children = await Child.find().populate('parent_id', 'name email phone');
        res.json({ success: true, children });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get child by ID - Admin/Teacher (all children) or Parent (own children only)
exports.getChildById = async (req, res) => {
    try {
        // Find child by ID and populate parent information
        const child = await Child.findById(req.params.id).populate('parent_id', 'name email phone');
        
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        // Check if parent is accessing their own child
        if (req.user.role === 'Parent' && child.parent_id._id.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.json({ success: true, child });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get my children - Parent only  
exports.getMyChildren = async (req, res) => {
    try {
        // Find children that belong to the current parent user
        const children = await Child.find({ parent_id: req.user.userId });
        res.json({ success: true, children });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update child - Admin only
exports.updateChild = async (req, res) => {
    try {
        const { name, birth_date, gender, parent_id, medical_notes, monthly_fee, semester_fee } = req.body;
        
        // Construct update object dynamically to handle optional fields
        const updateFields = { 
            name, 
            birth_date, 
            gender, 
            parent_id, 
            medical_notes,
            monthly_fee,
            semester_fee
        };

        // Update child and return updated data with parent information
        const child = await Child.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        ).populate('parent_id', 'name email phone');

        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        res.json({ 
            success: true, 
            message: "Child updated successfully", 
            child });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete child - Admin only
exports.deleteChild = async (req, res) => {
    try {
        // Find and delete child by ID
        const child = await Child.findByIdAndDelete(req.params.id);
        
        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        res.json({ success: true, message: "Child deleted successfully" });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};