const Facility = require('../models/facility.model');
const FacilityCondition = require('../models/facilityCondition.model');

exports.createFacility = async (req, res) => {
    try {
        const facility = await Facility.create(req.body);
        res.status(201).json({ success: true, facility });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getFacilities = async (req, res) => {
    try {
        const facilities = await Facility.find();
        res.json({ success: true, facilities });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getFacilityById = async (req, res) => {
    try {
        const facility = await Facility.findById(req.params.id);
        if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
        res.json({ success: true, facility });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateFacility = async (req, res) => {
    try {
        const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
        res.json({ success: true, facility });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteFacility = async (req, res) => {
    try {
        const facility = await Facility.findByIdAndDelete(req.params.id);
        if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
        res.json({ success: true, message: 'Facility deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Report condition (teacher or admin)
exports.reportCondition = async (req, res) => {
    try {
        const facilityId = req.params.id;
        const payload = { ...req.body, reportedBy: req.user.userId, facility: facilityId };
        const report = await FacilityCondition.create(payload);
        res.status(201).json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getConditions = async (req, res) => {
    try {
        const conditions = await FacilityCondition.find().populate('facility reportedBy', 'name email role');
        res.json({ success: true, conditions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateConditionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const condition = await FacilityCondition.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!condition) return res.status(404).json({ success: false, message: 'Condition not found' });
        res.json({ success: true, condition });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
