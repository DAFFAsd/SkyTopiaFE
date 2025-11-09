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
