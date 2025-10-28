const MonthlyReport = require('../models/monthlyReport.model');
const Child = require('../models/child.model');

// Create monthly report - Teacher only
exports.createMonthlyReport = async (req, res) => {
    try {
        const { child_id, semester, ...reportData } = req.body;
        
        // Verify that child exists
        const child = await Child.findById(child_id);
        if (!child) {
            return res.status(400).json({ success: false, message: "Child not found" });
        }

        // Check if report already exists for this child and semester
        const existingReport = await MonthlyReport.findOne({ 
            child_id, 
            semester 
        });
        
        if (existingReport) {
            return res.status(400).json({ 
                success: false, 
                message: "Monthly report for this child and semester already exists" 
            });
        }

        // Create new monthly report
        const monthlyReport = await MonthlyReport.create({
            child_id,
            teacher_id: req.user.userId,
            semester,
            ...reportData
        });

        // Populate child and teacher information for response
        const populatedReport = await MonthlyReport.findById(monthlyReport._id)
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');

        res.status(201).json({ 
            success: true, 
            message: "Monthly report created successfully", 
            report: populatedReport 
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all monthly reports - Admin only
exports.getAllMonthlyReports = async (req, res) => {
    try {
        // Find all monthly reports with populated child and teacher info
        const reports = await MonthlyReport.find()
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');
        
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get monthly reports by teacher - Teacher only  
exports.getMyMonthlyReports = async (req, res) => {
    try {
        // Find reports created by the current teacher
        const reports = await MonthlyReport.find({ teacher_id: req.user.userId })
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');
        
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get monthly reports for my child - Parent only
exports.getMyChildMonthlyReports = async (req, res) => {
    try {
        // Find all children belonging to the parent
        const myChildren = await Child.find({ parent_id: req.user.userId });
        const childIds = myChildren.map(child => child._id);

        // Find reports for the parent's children
        const reports = await MonthlyReport.find({ child_id: { $in: childIds } })
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');
        
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get monthly report by ID - Admin (all reports), Teacher (own reports only), Parent (own child only)
exports.getMonthlyReportById = async (req, res) => {
    try {
        // Find report by ID with populated data
        const report = await MonthlyReport.findById(req.params.id)
            .populate('child_id', 'name birth_date gender parent_id')
            .populate('teacher_id', 'name email');

        if (!report) {
            return res.status(404).json({ success: false, message: "Monthly report not found" });
        }

        // Check if parent is accessing report for their own child
        if (req.user.role === 'Parent') {
            const child = await Child.findById(report.child_id._id);
            if (child.parent_id.toString() !== req.user.userId) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }
        }

        // Check if teacher is accessing their own report
        if (req.user.role === 'Teacher' && report.teacher_id._id.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Partial update for checklist style - Teacher only
exports.partialUpdateMonthlyReport = async (req, res) => {
    try {
        const { updates } = req.body; // { "field.path": value }
        
        // Find report first to verify ownership
        const existingReport = await MonthlyReport.findById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ success: false, message: "Monthly report not found" });
        }

        // Check if teacher is updating their own report
        if (existingReport.teacher_id.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Apply partial updates
        const updateQuery = {};
        for (const [path, value] of Object.entries(updates)) {
            const fieldPath = path.split('.');
            if (fieldPath.length === 2) {
                if (!updateQuery[fieldPath[0]]) updateQuery[fieldPath[0]] = {};
                updateQuery[fieldPath[0]][fieldPath[1]] = value;
            }
        }

        // Update the report
        const report = await MonthlyReport.findByIdAndUpdate(
            req.params.id,
            { $set: updateQuery },
            { new: true, runValidators: true }
        )
        .populate('child_id', 'name birth_date gender')
        .populate('teacher_id', 'name email');

        res.json({ 
            success: true, 
            message: "Monthly report updated successfully", 
            report 
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update monthly report - Teacher only (full update)
exports.updateMonthlyReport = async (req, res) => {
    try {
        const { semester, ...updateData } = req.body;
        
        // Find report first to verify ownership
        const existingReport = await MonthlyReport.findById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ success: false, message: "Monthly report not found" });
        }

        // Check if teacher is updating their own report
        if (existingReport.teacher_id.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Update the report
        const report = await MonthlyReport.findByIdAndUpdate(
            req.params.id,
            { semester, ...updateData },
            { new: true, runValidators: true }
        )
        .populate('child_id', 'name birth_date gender')
        .populate('teacher_id', 'name email');

        res.json({ 
            success: true, 
            message: "Monthly report updated successfully", 
            report 
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete monthly report - Teacher only (own reports)
exports.deleteMonthlyReport = async (req, res) => {
    try {
        // Find report first to verify ownership
        const report = await MonthlyReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: "Monthly report not found" });
        }

        // Check if teacher is deleting their own report
        if (report.teacher_id.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await MonthlyReport.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Monthly report deleted successfully" });
        
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};