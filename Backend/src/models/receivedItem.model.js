const mongoose = require('mongoose');

const receivedItemSchema = new mongoose.Schema({
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryRequest' }, // Not required for manual admin entry
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    itemName: { type: String, required: true },
    quantityRequested: { type: Number, default: 0 }, // Default 0 for manual entry
    quantityReceived: { type: Number, required: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
    receivedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ReceivedItem', receivedItemSchema);
