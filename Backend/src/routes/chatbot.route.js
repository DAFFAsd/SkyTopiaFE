const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireParent, requireAdmin } = require('../middleware/roleCheck');

// Routes for both Parent and Admin
router.post('/new', authMiddleware, chatbotController.startChatbot);
router.post('/:threadId/message', authMiddleware, chatbotController.continueChatbot);
router.get('/history/:threadId', authMiddleware, chatbotController.getChatHistory);
router.get('/sessions', authMiddleware, chatbotController.getUserChatSessions);
router.delete('/:threadId', authMiddleware, chatbotController.deleteChatSession);

module.exports = router;