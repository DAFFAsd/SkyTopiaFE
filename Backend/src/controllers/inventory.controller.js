const InventoryItem = require('../models/inventory.model');
const InventoryRequest = require('../models/inventoryRequest.model');
const ReceivedItem = require('../models/receivedItem.model');

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
        const { itemName, quantity } = req.body;

        // Validate quantity
        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Jumlah permintaan harus minimal 1' });
        }

        // Get item by name to check stock
        const item = await InventoryItem.findOne({ name: itemName });
        if (!item) {
            return res.status(400).json({ success: false, message: 'Barang tidak ditemukan' });
        }

        // Validate stock availability
        if (item.quantity < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `Stok tidak cukup. Stok tersedia: ${item.quantity}` 
            });
        }

        const payload = { 
            itemName, 
            quantity, 
            requestedBy: req.user.userId,
            item: item._id 
        };
        const request = await InventoryRequest.create(payload);
        res.status(201).json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Admin: list all requests with filters
exports.getRequests = async (req, res) => {
    try {
        const { status, dateFilter, search } = req.query;
        let query = {};

        // Filter by status
        if (status && status !== 'all') {
            query.status = status.charAt(0).toUpperCase() + status.slice(1);
        }

        // Filter by date
        if (dateFilter && dateFilter !== 'all') {
            const now = new Date();
            let startDate;
            
            if (dateFilter === 'today') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                startDate = weekAgo;
            } else if (dateFilter === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            }

            if (startDate) {
                query.createdAt = { $gte: startDate };
            }
        }

        // Get requests with applied filters
        let requests = await InventoryRequest.find(query)
            .populate('item requestedBy approvedBy', 'name email')
            .sort({ createdAt: -1 });

        // Search by item name or teacher name (client-side filtering for flexibility)
        if (search) {
            requests = requests.filter(req => 
                req.itemName.toLowerCase().includes(search.toLowerCase()) ||
                (req.requestedBy && req.requestedBy.name && req.requestedBy.name.toLowerCase().includes(search.toLowerCase()))
            );
        }

        // Calculate stats from all requests (not just filtered)
        const allRequests = await InventoryRequest.find();
        const stats = {
            total: allRequests.length,
            approved: allRequests.filter(r => r.status === 'Approved').length,
            rejected: allRequests.filter(r => r.status === 'Rejected').length,
            pending: allRequests.filter(r => r.status === 'Pending').length,
            approvalRate: allRequests.length > 0 ? Math.round((allRequests.filter(r => r.status === 'Approved').length / allRequests.length) * 100) : 0
        };

        res.json({ success: true, requests, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Teacher: get own requests
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await InventoryRequest.find({ requestedBy: req.user.userId })
            .populate('item requestedBy approvedBy', 'name email')
            .sort({ createdAt: -1 });
        
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

// Teacher/Admin: Record item as received
exports.recordReceivedItem = async (req, res) => {
    try {
        const { requestId, itemName, quantityRequested, quantityReceived, notes } = req.body;

        // Validate basic input
        if (!quantityReceived || quantityReceived < 1) {
            return res.status(400).json({ success: false, message: 'Jumlah yang diterima harus minimal 1' });
        }

        let receivedItemData = {
            quantityReceived,
            receivedBy: req.user.userId,
            notes: notes || '',
            receivedDate: new Date()
        };

        // If requestId is provided (from approved request)
        if (requestId) {
            const request = await InventoryRequest.findById(requestId);
            if (!request) {
                return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
            }

            // Validate quantity
            if (quantityReceived > request.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Jumlah yang diterima tidak boleh melebihi ${request.quantity}` 
                });
            }

            receivedItemData.request = requestId;
            receivedItemData.item = request.item;
            receivedItemData.itemName = request.itemName;
            receivedItemData.quantityRequested = request.quantity;
        } 
        // If manual entry (Admin only)
        else {
            if (!itemName || !itemName.trim()) {
                return res.status(400).json({ success: false, message: 'Nama barang harus diisi' });
            }

            receivedItemData.itemName = itemName;
            receivedItemData.quantityRequested = quantityRequested || 0;
        }

        // Create received item record
        const receivedItem = await ReceivedItem.create(receivedItemData);

        res.status(201).json({ success: true, received: receivedItem });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get received items (Teacher - own, Admin - all)
exports.getReceivedItems = async (req, res) => {
    try {
        const { dateFilter, search } = req.query;
        let query = {};

        // If teacher, only get their own
        if (req.user.role === 'teacher') {
            query.receivedBy = req.user.userId;
        }

        // Filter by date
        if (dateFilter && dateFilter !== 'all') {
            const now = new Date();
            let startDate;
            
            if (dateFilter === 'today') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                startDate = weekAgo;
            } else if (dateFilter === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            }

            if (startDate) {
                query.receivedDate = { $gte: startDate };
            }
        }

        // Get received items
        let received = await ReceivedItem.find(query)
            .populate('request receivedBy', 'itemName name')
            .sort({ receivedDate: -1 });

        // Search by item name or receiver name
        if (search) {
            received = received.filter(item =>
                item.itemName.toLowerCase().includes(search.toLowerCase()) ||
                (item.receivedBy && item.receivedBy.name && item.receivedBy.name.toLowerCase().includes(search.toLowerCase()))
            );
        }

        res.json({ success: true, received });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
