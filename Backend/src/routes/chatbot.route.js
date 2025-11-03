const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { authMiddleware } = require('../middleware/auth');
const { requireParent } = require('../middleware/roleCheck');

router.post('/new', authMiddleware, requireParent, chatbotController.startChatbot);
router.post('/:threadId/message', authMiddleware, requireParent, chatbotController.continueChatbot);
router.get('/history/:threadId', authMiddleware, requireParent, chatbotController.getChatHistory);
router.get('/sessions', authMiddleware, requireParent, chatbotController.getUserChatSessions);
router.delete('/:threadId', authMiddleware, requireParent, chatbotController.deleteChatSession);

module.exports = router;