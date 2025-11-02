const mongoose = require('mongoose');

// Template for individual chat message
const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Template for chat session (parent document)
const chatSessionSchema = new mongoose.Schema({
    thread_id: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String },
    messages: [messageSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Update timestamp before saving
chatSessionSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
module.exports = ChatSession;