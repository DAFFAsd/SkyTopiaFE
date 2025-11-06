const Child = require('../models/child.model');
const User = require('../models/user.model');

// Create new child - Admin only
exports.createChild = async (req, res) => {
    try {
        const { name, birth_date, gender, parent_id, medical_notes, monthly_fee, semester_fee, schedules } = req.body;

        // Verify that parent_id exists and is a Parent role
        const parent = await User.findById(parent_id);
        if (!parent || parent.role !== 'Parent') {
            return res.status(400).json({ success: false, message: "Invalid parent ID or user is not a parent" });
        }

        // Create new child in database
        const child = await Child.create({
            name,
            birth_date,
            gender,
            parent_id,
            medical_notes,
            monthly_fee,
            semester_fee,
            schedules: schedules || []
        });

        // Populate parent information for response
        const populatedChild = await Child.findById(child._id)
            .populate('parent_id', 'name email phone')
            .populate({
                path: 'schedules',
                select: 'title day startTime endTime teacher location curriculum',
                populate: [
                    { path: 'teacher', select: 'name' },
                    { path: 'curriculum', select: 'title' }
                ]
            });

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
        const children = await Child.find()
            .populate('parent_id', 'name email phone')
            .populate({
                path: 'schedules',
                select: 'title day startTime endTime teacher location curriculum',
                populate: [
                    { path: 'teacher', select: 'name' },
                    { path: 'curriculum', select: 'title' }
                ]
            });

        res.json({ success: true, children });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get child by ID - Admin/Teacher (all children) or Parent (own children only)
exports.getChildById = async (req, res) => {
    try {
        // Find child by ID and populate parent information
        const child = await Child.findById(req.params.id)
            .populate('parent_id', 'name email phone')
            .populate({
                path: 'schedules',
                select: 'title day startTime endTime teacher location curriculum',
                populate: [
                    { path: 'teacher', select: 'name email' },
                    { path: 'curriculum', select: 'title description grade' }
                ]
            });

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
        const children = await Child.find({ parent_id: req.user.userId })
            .populate({
                path: 'schedules',
                select: 'title day startTime endTime teacher location curriculum',
                populate: [
                    { path: 'teacher', select: 'name' },
                    { path: 'curriculum', select: 'title description grade' }
                ]
            });

        res.json({ success: true, children });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update child - Admin only
exports.updateChild = async (req, res) => {
    try {
        const { name, birth_date, gender, parent_id, medical_notes, monthly_fee, semester_fee, schedules } = req.body;

        // Construct update object dynamically to handle optional fields
        const updateFields = {
            name,
            birth_date,
            gender,
            parent_id,
            medical_notes,
            monthly_fee,
            semester_fee,
            schedules
        };

        // Update child and return updated data with parent information
        const child = await Child.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true, runValidators: true }
        )
        .populate('parent_id', 'name email phone')
        .populate({
            path: 'schedules',
            select: 'title day startTime endTime teacher location curriculum',
            populate: [
                { path: 'teacher', select: 'name' },
                { path: 'curriculum', select: 'title' }
            ]
        });

        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        res.json({
            success: true,
            message: "Child updated successfully",
            child
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Add schedule to child - Admin only
exports.addScheduleToChild = async (req, res) => {
    try {
        const { childId, scheduleId } = req.body;

        const child = await Child.findByIdAndUpdate(
            childId,
            { $addToSet: { schedules: scheduleId } },
            { new: true }
        )
        .populate({
            path: 'schedules',
            select: 'title day startTime endTime teacher location curriculum',
            populate: [
                { path: 'teacher', select: 'name' },
                { path: 'curriculum', select: 'title' }
            ]
        });

        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        res.json({
            success: true,
            message: "Schedule added to child successfully",
            child
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Remove schedule from child - Admin only
exports.removeScheduleFromChild = async (req, res) => {
    try {
        const { childId, scheduleId } = req.body;

        const child = await Child.findByIdAndUpdate(
            childId,
            { $pull: { schedules: scheduleId } },
            { new: true }
        )
        .populate({
            path: 'schedules',
            select: 'title day startTime endTime teacher location curriculum',
            populate: [
                { path: 'teacher', select: 'name' },
                { path: 'curriculum', select: 'title' }
            ]
        });

        if (!child) {
            return res.status(404).json({ success: false, message: "Child not found" });
        }

        res.json({
            success: true,
            message: "Schedule removed from child successfully",
            child
        });

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

// Search children by name or parent name - Admin only
exports.searchChildren = async (req, res) => {
    try {
        const { search } = req.query;

        if (!search) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        // Search children by child name or parent name
        const children = await Child.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                {
                    parent_id: {
                        $in: await User.find({
                            name: { $regex: search, $options: 'i' },
                            role: 'Parent'
                        }).select('_id')
                    }
                }
            ]
        })
        .populate('parent_id', 'name email phone')
        .populate({
            path: 'schedules',
            select: 'title day',
            populate: [
                { path: 'teacher', select: 'name' }
            ]
        });

        res.json({
            success: true,
            count: children.length,
            children
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};