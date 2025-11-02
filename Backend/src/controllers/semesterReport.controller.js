const SemesterReport = require('../models/semesterReport.model');
const Child = require('../models/child.model');

// Create semester report - Teacher only
exports.createSemesterReport = async (req, res) => {
    try {
        const { child_id, semester, ...reportData } = req.body;
        
        // Validate semester format
        if (!semester || !semester.match(/^\d{4}-[12]$/)) {
            return res.status(400).json({
                success: false,
                message: "Semester must be in format: YYYY-1 or YYYY-2 (example: 2025-1, 2025-2)"
            });
        }

        // Verify that child exists
        const child = await Child.findById(child_id);
        if (!child) {
            return res.status(400).json({ success: false, message: "Child not found" });
        }

        // Check if report already exists for this child and semester
        const existingReport = await SemesterReport.findOne({ child_id, semester });
        if (existingReport) {
            return res.status(400).json({ 
                success: false, 
                message: "Semester report for this child and semester already exists" 
            });
        }

        // Create new semester report
        const semesterReport = await SemesterReport.create({
            child_id,
            teacher_id: req.user.userId,
            semester,
            ...reportData
        });

        // Populate child and teacher information for response
        const populatedReport = await SemesterReport.findById(semesterReport._id)
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');

        res.status(201).json({ 
            success: true, 
            message: "Semester report created successfully", 
            report: populatedReport 
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all semester reports - Admin only
exports.getAllSemesterReports = async (req, res) => {
    try {
        // Find all semester reports with populated child and teacher info
        const reports = await SemesterReport.find()
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');
        
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get semester reports by teacher - Teacher only  
exports.getMySemesterReports = async (req, res) => {
    try {
        // Find reports created by the current teacher
        const reports = await SemesterReport.find({ teacher_id: req.user.userId })
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');
        
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get semester reports for my child - Parent only
exports.getMyChildSemesterReports = async (req, res) => {
    try {
        // Find all children belonging to the parent
        const myChildren = await Child.find({ parent_id: req.user.userId });
        const childIds = myChildren.map(child => child._id);

        // Find reports for the parent's children
        const reports = await SemesterReport.find({ child_id: { $in: childIds } })
            .populate('child_id', 'name birth_date gender')
            .populate('teacher_id', 'name email');
        
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get semester report by ID - Admin (all reports), Teacher (own reports only), Parent (own child only)
exports.getSemesterReportById = async (req, res) => {
    try {
        // Find report by ID with populated data
        const report = await SemesterReport.findById(req.params.id)
            .populate('child_id', 'name birth_date gender parent_id')
            .populate('teacher_id', 'name email');

        if (!report) {
            return res.status(404).json({ success: false, message: "Semester report not found" });
        }

        // Check if parent is accessing report for their own child
        if (req.user.role === 'Parent') {
            if (report.child_id.parent_id.toString() !== req.user.userId) {
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

// Partial update for checklist style frontend - Teacher only
exports.partialUpdateSemesterReport = async (req, res) => {
    try {
        const { updates } = req.body;
        
        // Find report
        const existingReport = await SemesterReport.findById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ success: false, message: "Semester report not found" });
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
                if (!updateQuery[fieldPath[0]]) {
                    updateQuery[fieldPath[0]] = {};
                }
                updateQuery[fieldPath[0]][fieldPath[1]] = value;
                
                /*  misal :
                    fieldPath[0] = 'religious_moral'
                    fieldPath[1] = 'berdoa_sebelum_kegiatan' 
                    value = 'Konsisten' 
                */
            }
        }

        // Update the report
        const report = await SemesterReport.findByIdAndUpdate(
            req.params.id,
            { $set: updateQuery },
            { new: true, runValidators: true }
        )
        .populate('child_id', 'name birth_date gender')
        .populate('teacher_id', 'name email');

        res.json({ success: true, message: "Semester report updated successfully", report });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update semester report - Teacher only (full update)
exports.updateSemesterReport = async (req, res) => {
    try {
        const { semester, ...updateData } = req.body;
        
        // Find report
        const existingReport = await SemesterReport.findById(req.params.id);
        if (!existingReport) {
            return res.status(404).json({ success: false, message: "Semester report not found" });
        }

        // Check if teacher is updating their own report
        if (existingReport.teacher_id.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Update the report
        const report = await SemesterReport.findByIdAndUpdate(
            req.params.id,
            { semester, ...updateData },
            { new: true, runValidators: true }
        )
        .populate('child_id', 'name birth_date gender')
        .populate('teacher_id', 'name email');

        res.json({ success: true, message: "Semester report updated successfully", report });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete semester report - Teacher only (own reports)
exports.deleteSemesterReport = async (req, res) => {
    try {
        // Find report
        const report = await SemesterReport.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: "Semester report not found" });
        }

        // Check if teacher is deleting their own report
        if (report.teacher_id.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await SemesterReport.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Semester report deleted successfully" });
        
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};