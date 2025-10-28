const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    session_id: { type: String, required: true, unique: true },
    
    messages: [{
        role: { type: String, enum: ["Pengguna", "Asisten"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    
    status: { type: String, enum: ["active", "closed"], default: "active" },
    last_activity: { type: Date, default: Date.now }

}, { timestamps: true });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);
module.exports = ChatSession;