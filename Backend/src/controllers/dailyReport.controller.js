const DailyReport = require('../models/dailyReport.model');
const Child = require('../models/child.model');

// Create daily report - Teacher only
exports.createDailyReport = async (req, res) => {
    try {
        const { child_id, date, theme, sub_theme, physical_motor, cognitive, social_emotional, meals, nap_duration, special_notes } = req.body;
        
        // Verify that child exists
        const child = await Child.findById(child_id);
        if (!child) {
            return res.status(400).json({ success: false, message: "Child not found" });
        }

        // Create new daily report
        const dailyReport = await DailyReport.create({
            child_id,
            teacher_id: req.user.userId,
            date,
            theme,
            sub_theme,
            physical_motor,
            cognitive,
            social_emotional,
            meals,
            nap_duration,
            special_notes
        });

        // Populate child and teacher information for response
        const populatedReport = await DailyReport.findById(dailyReport._id)
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');

        res.status(201).json({ 
            success: true, 
            message: "Daily report created successfully", 
            report: populatedReport 
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all daily reports - Admin only
exports.getAllDailyReports = async (req, res) => {
    try {
        // Find all daily reports with populated child and teacher info
        const reports = await DailyReport.find()
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');
        
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get daily reports by teacher - Teacher only
exports.getMyDailyReports = async (req, res) => {
    try {
        // Find reports created by the current teacher
        const reports = await DailyReport.find({ teacher_id: req.user.userId })
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');
        
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get daily reports for my child - Parent only
exports.getMyChildReports = async (req, res) => {
    try {
        // Find all children belonging to the parent
        const myChildren = await Child.find({ parent_id: req.user.userId });
        const childIds = myChildren.map(child => child._id);

        // Find reports for the parent's children
        const reports = await DailyReport.find({ child_id: { $in: childIds } })
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');
        
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get daily report by ID - Admin (all reports), Teacher (own reports only), Parent (own child only)
exports.getDailyReportById = async (req, res) => {
    try {
        // Find report by ID with populated data
        const report = await DailyReport.findById(req.params.id)
            .populate('child_id', 'name birth_date gender parent_id')
            .populate('teacher_id', 'name email');

        if (!report) {
            return res.status(404).json({ success: false, message: "Daily report not found" });
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

// Update daily report - Teacher only (own reports)
exports.updateDailyReport = async (req, res) => {
    try {
        const { theme, sub_theme, physical_motor, cognitive, social_emotional, meals, nap_duration, special_notes } = req.body;
        
        // Find report first to verify ownership
        const existingReport = await DailyReport.findById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ success: false, message: "Daily report not found" });
        }

        // Check if teacher is updating their own report
        if (existingReport.teacher_id.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Update the report
        const report = await DailyReport.findByIdAndUpdate(
            req.params.id,
            { theme, sub_theme, physical_motor, cognitive, social_emotional, meals, nap_duration, special_notes },
            { new: true, runValidators: true }
        )
        .populate('child_id', 'name birth_date gender')
        .populate('teacher_id', 'name email');

        res.json({ 
            success: true, 
            message: "Daily report updated successfully", 
            report 
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete daily report - Teacher only (own reports)
exports.deleteDailyReport = async (req, res) => {
    try {
        // Find report first to verify ownership
        const report = await DailyReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: "Daily report not found" });
        }

        // Check if teacher is deleting their own report
        if (report.teacher_id.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await DailyReport.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Daily report deleted successfully" });
    
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};