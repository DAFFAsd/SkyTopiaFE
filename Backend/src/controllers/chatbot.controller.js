const AgentService = require("../services/agent");
const agentService = new AgentService();
const ChatSession = require("../models/chatbot.model");

// Start new chatbot session for parent
exports.startChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user;
        
        // Validate message input
        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, error: "Message is required" });
        }

        // Generate unique thread ID and get AI response
        const threadId = `thread_${Date.now()}_${user.userId}`;
        const response = await agentService.callAgent(message, threadId, user);
        
        res.json({
            success: true,
            thread_id: threadId,
            response,
            message: "Chatbot session started successfully"
        });
    } catch (error) {
        console.error('Error starting chatbot:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Continue existing chatbot session with new message
exports.continueChatbot = async (req, res) => {
    try {
        const { threadId } = req.params;
        const { message } = req.body;
        const user = req.user;
        
        // Validate required inputs
        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, error: "Message is required" });
        }
        if (!threadId) {
            return res.status(400).json({ success: false, error: "Thread ID is required" });
        }

        // Send message to existing chat session
        const response = await agentService.callAgent(message, threadId, user);
        
        res.json({
            success: true,
            thread_id: threadId,
            response,
            message: "Message sent successfully"
        });
    } catch (error) {
        console.error('Error in chatbot:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get complete chat history for specific thread (chat session)
exports.getChatHistory = async (req, res) => {
    try {
        const { threadId } = req.params;
        const user = req.user;
        
        // Validate thread ID parameter
        if (!threadId) {
            return res.status(400).json({ success: false, error: "Thread ID is required" });
        }

        // Retrieve chat history from database
        const chatHistory = await ChatSession.findOne({ thread_id: threadId, user_id: user.userId })
            .populate('user_id', 'name email');

        if (!chatHistory) {
            return res.status(404).json({ success: false, error: "Chat session not found" });
        }
        
        res.json({ success: true, data: chatHistory });
    } catch (error) {
        console.error('Error getting chat history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all chat sessions for current parent user
exports.getUserChatSessions = async (req, res) => {
    try {
        const user = req.user;
        
        // Retrieve all chat sessions for user
        const sessions = await ChatSession.find({ user_id: user.userId })
            .sort({ updated_at: -1 })  // descending 
            .select('thread_id title created_at updated_at');
        
        res.json({
            success: true,
            data: sessions,
            count: sessions.length
        });
    } catch (error) {
        console.error('Error getting user chat sessions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete specific chat session
exports.deleteChatSession = async (req, res) => {
    try {
        const { threadId } = req.params;
        const user = req.user;
        
        // Validate thread ID parameter
        if (!threadId) {
            return res.status(400).json({ success: false, error: "Thread ID is required" });
        }

        // Delete chat session from database
        const result = await ChatSession.findOneAndDelete({ 
            thread_id: threadId, 
            user_id: user.userId 
        });
        
        if (!result) {
            return res.status(404).json({ success: false, error: "Chat session not found" });
        }
        
        res.json({
            success: true,
            message: "Chat session deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting chat session:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};