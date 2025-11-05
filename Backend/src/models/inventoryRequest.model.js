const mongoose = require('mongoose');

const inventoryRequestSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    itemName: { type: String },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('InventoryRequest', inventoryRequestSchema);
