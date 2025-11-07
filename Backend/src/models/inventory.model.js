const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
    description: { type: String },
    quantity: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventorySchema);
