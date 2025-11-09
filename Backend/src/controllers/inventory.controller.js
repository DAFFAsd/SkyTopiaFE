const InventoryItem = require('../models/inventory.model');
const InventoryRequest = require('../models/inventoryRequest.model');

// CRUD for inventory items (Admin)
exports.createItem = async (req, res) => {
    try {
        const item = await InventoryItem.create(req.body);
        res.status(201).json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getItems = async (req, res) => {
    try {
        const items = await InventoryItem.find().populate('facility', 'name');
        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await InventoryItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Teacher requests an item
exports.requestItem = async (req, res) => {
    try {
        const payload = { ...req.body, requestedBy: req.user.userId };
        const request = await InventoryRequest.create(payload);
        res.status(201).json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: list all requests
exports.getRequests = async (req, res) => {
    try {
        const requests = await InventoryRequest.find().populate('item requestedBy approvedBy', 'name email');
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin approve/reject
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const update = { status };
        if (status === 'Approved') {
            update.approvedBy = req.user.userId;
            update.approvedAt = new Date();
        }
        const request = await InventoryRequest.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

        // If approved and an item reference exists, decrement quantity
        if (status === 'Approved' && request.item) {
            const item = await InventoryItem.findById(request.item);
            if (item) {
                item.quantity = Math.max(0, item.quantity - request.quantity);
                await item.save();
            }
        }

        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: get inventory requests report with stats
exports.getRequestsReport = async (req, res) => {
    try {
        const { status, dateFilter } = req.query;

        // Build filter query
        let filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Date filter
        if (dateFilter && dateFilter !== 'all') {
            const now = new Date();
            let startDate;

            switch (dateFilter) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
            }

            if (startDate) {
                filter.createdAt = { $gte: startDate };
            }
        }

        // Get filtered requests
        const requests = await InventoryRequest.find(filter)
            .populate('item requestedBy approvedBy', 'name email')
            .sort({ createdAt: -1 });

        // Calculate statistics
        const total = await InventoryRequest.countDocuments();
        const approved = await InventoryRequest.countDocuments({ status: 'Approved' });
        const rejected = await InventoryRequest.countDocuments({ status: 'Rejected' });
        const pending = await InventoryRequest.countDocuments({ status: 'Pending' });
        const approvalRate = total > 0 ? Math.round((approved / (approved + rejected)) * 100) : 0;

        const stats = {
            total,
            approved,
            rejected,
            pending,
            approvalRate
        };

        res.json({ success: true, requests, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
