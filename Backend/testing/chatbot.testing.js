jest.resetModules();  
// Parent Only

// Mock dependencies
// Mock AgentService Class
const mockSaveChatHistory = jest.fn().mockResolvedValue(true);
const mockEnsureInitialized = jest.fn().mockResolvedValue(true);
const mockCallAgent = jest.fn();

// The callAgent resolves with a STRING the AI response content
const MOCK_AI_RESPONSE_STRING = "Hello I am a mock AI, how can I help?";

// Mock the AgentService class and its methods
jest.mock('../src/services/agent', () => {
    return jest.fn().mockImplementation(() => {
        return {
            callAgent: mockCallAgent.mockResolvedValue(MOCK_AI_RESPONSE_STRING),
            saveChatHistory: mockSaveChatHistory,
            ensureInitialized: mockEnsureInitialized,
        };
    });
});

// Mock Mongoose Chatbot Model
jest.mock('../src/models/chatbot.model', () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndDelete: jest.fn()
}));

const ChatSession = require('../src/models/chatbot.model');
const AgentService = require('../src/services/agent');
// Get the instance created by the require statement in the controller
const mockAgentServiceInstance = new AgentService(); 
const chatbotController = require('../src/controllers/chatbot.controller');

describe('Chatbot Controller', () => {
    let mockReq, mockRes;
    // Use role Parent by default for successful scenarios
    const mockUser = { userId: 'parent123', role: 'Parent', name: 'Test Parent' };

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            query: {},
            user: mockUser
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
        // Reset callAgent mock for fresh start and set default success value
        mockCallAgent.mockClear(); 
        mockCallAgent.mockResolvedValue(MOCK_AI_RESPONSE_STRING);
    });

    // startChatbot test suite
    describe('startChatbot', () => {
        const mockMessage = 'Hi bot';
        
        test('should start new session and return response on valid parent input', async () => {
            mockReq.body.message = mockMessage;
            
            await chatbotController.startChatbot(mockReq, mockRes);
            
            expect(mockCallAgent).toHaveBeenCalled();
            
            // Check if threadId creation includes user ID
            const calledThreadId = mockCallAgent.mock.calls[0][1];
            expect(calledThreadId).toContain(mockUser.userId); 
            expect(mockRes.status).not.toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                thread_id: calledThreadId,
                // The response is the string returned by mockCallAgent
                response: MOCK_AI_RESPONSE_STRING, 
                message: "Chatbot session started successfully"
            });
        });

        test('should return 400 if message is missing', async () => {
            mockReq.body.message = ''; 

            await chatbotController.startChatbot(mockReq, mockRes);
            
            expect(mockCallAgent).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false, 
                error: "Message is required"
            });
        });

        // Test Role Validation
        test('should return 500 if user is not a Parent', async () => {
            // Override user role for this test
            mockReq.user.role = 'Admin'; 
            mockReq.body.message = mockMessage;

            // Mock AgentService to throw the role error (this error is NOT prefixed by callAgent)
            mockCallAgent.mockRejectedValueOnce(new Error("Chatbot is only available for parents"));

            await chatbotController.startChatbot(mockReq, mockRes);
            
            // Verify controller uses the exact error message
            expect(mockRes.status).toHaveBeenCalledWith(500); 
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Chatbot is only available for parents"
            });
            // Ensure only one response call
            expect(mockRes.json).toHaveBeenCalledTimes(1); 
        });
        
        // Generic Failure
        test('should return 500 on generic agent service failure', async () => {
            mockReq.body.message = mockMessage;
            const mockErrorMessage = 'Database connection lost';
            
            // MOCK RE-THROWN ERROR: callAgent's 'else' block will re-throw as 'Chatbot failed: ...'
            const rethrownError = new Error(`Chatbot failed: ${mockErrorMessage}`);
            mockCallAgent.mockRejectedValueOnce(rethrownError);

            await chatbotController.startChatbot(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            
            // EXPECTED: The controller receives the fully formatted error
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: rethrownError.message
            });
        });
        
        // FIXED TEST CASE Request Timeout
        test('should return 500 with friendly message on Request timeout', async () => {
            mockReq.body.message = mockMessage;
            
            // MOCK RE-THROWN ERROR: callAgent handles 'Request timeout' and re-throws with the friendly message
            const friendlyError = 'Chatbot is currently busy, please try again later';
            // We need to mock it throwing the error that the controller expects
            const rethrownError = new Error(`Chatbot failed: ${friendlyError}`); // Assumed final format

            // However, the callAgent code itself is: throw new Error(`Chatbot failed: ${error.message}`); in the catch block if not a timeout
            // For timeout: throw new Error("Chatbot is currently busy, please try again later"); (NO Chatbot failed prefix)
            
            // Let's re-read the original callAgent catch logic:
            // if (error.message.includes("Request timeout")) { throw new Error("Chatbot is currently busy, please try again later"); }
            // else { throw new Error(`Chatbot failed: ${error.message}`); }

            // SCENARIO A: Timeout -> Error message should be 'Chatbot is currently busy, please try again later'
            mockCallAgent.mockRejectedValueOnce(new Error("Chatbot is currently busy, please try again later"));
            
            await chatbotController.startChatbot(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Chatbot is currently busy, please try again later"
            });

            // Reset mockRes for the next case
            mockRes.status.mockClear();
            mockRes.json.mockClear();
            
            // SCENARIO B: 429 Error -> Error message should be 'Service is busy. Please try again in 1 minute.'
            // If the original error status was 429, callAgent rethrows: throw new Error("Service is busy. Please try again in 1 minute.");
            const error429 = new Error("Service is busy. Please try again in 1 minute.");
            error429.status = 429;
            mockCallAgent.mockRejectedValueOnce(error429);
            
            await chatbotController.startChatbot(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: error429.message
            });
        });
    });

    // --- continueChatbot test suite ---
    describe('continueChatbot', () => {
        const testThreadId = 'thread_456_parent123';
        
        test('should continue session and return response on valid input', async () => {
            mockReq.params.threadId = testThreadId;
            mockReq.body.message = 'Next message';

            await chatbotController.continueChatbot(mockReq, mockRes);
            
            expect(mockCallAgent).toHaveBeenCalledWith(
                'Next message', 
                testThreadId, 
                mockUser
            );
            expect(mockRes.status).not.toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                thread_id: testThreadId,
                response: MOCK_AI_RESPONSE_STRING,
                message: "Message sent successfully"
            });
        });

        test('should return 400 if threadId is missing', async () => {
            mockReq.params.threadId = undefined; 
            mockReq.body.message = 'Test message';

            await chatbotController.continueChatbot(mockReq, mockRes);
            
            expect(mockCallAgent).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false, 
                error: "Thread ID is required"
            });
        });
        
        test('should return 400 if message is missing', async () => {
            mockReq.params.threadId = testThreadId; 
            mockReq.body.message = '';

            await chatbotController.continueChatbot(mockReq, mockRes);
            
            expect(mockCallAgent).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false, 
                error: "Message is required"
            });
        });
    });

    // --- getChatHistory test suite ---
    describe('getChatHistory', () => {
        const testThreadId = 'thread_123_parent123';
        const mockHistory = {
            thread_id: testThreadId,
            user_id: { _id: 'parent123', name: 'Test Parent', email: 'parent@test.com' },
            messages: [{ role: 'user', content: 'hello' }, { role: 'ai', content: 'hi' }]
        };
        
        // Mocking the Mongoose chain for findOne() populate()
        const mockPopulate = {
            populate: jest.fn().mockResolvedValue(mockHistory)
        };

        test('should return chat history for valid threadId', async () => {
            mockReq.params.threadId = testThreadId;
            ChatSession.findOne.mockReturnValue(mockPopulate);

            await chatbotController.getChatHistory(mockReq, mockRes);
            
            expect(ChatSession.findOne).toHaveBeenCalledWith({ 
                thread_id: testThreadId, 
                user_id: mockUser.userId 
            });
            expect(mockPopulate.populate).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockHistory
            });
        });

        test('should return 404 if chat session not found', async () => {
            mockReq.params.threadId = 'nonexistent';
            // Mocking the Mongoose chain to resolve null
            const mockPopulateNotFound = {
                populate: jest.fn().mockResolvedValue(null)
            };
            ChatSession.findOne.mockReturnValue(mockPopulateNotFound);

            await chatbotController.getChatHistory(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false, 
                error: "Chat session not found"
            });
        });

        test('should return 400 if threadId is missing', async () => {
            mockReq.params.threadId = undefined;

            await chatbotController.getChatHistory(mockReq, mockRes);
            
            expect(ChatSession.findOne).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false, 
                error: "Thread ID is required"
            });
        });
    });
    
    // --- getUserChatSessions test suite ---
    describe('getUserChatSessions', () => {
        const mockSessions = [
            { thread_id: 't1', title: 'Q about fees', created_at: new Date() },
            { thread_id: 't2', title: 'Q about schedules', created_at: new Date() }
        ];

        // Mocking the Mongoose chain for find() sort() select()
        const mockSelect = {
            select: jest.fn().mockResolvedValue(mockSessions)
        };
        const mockSort = {
            sort: jest.fn().mockReturnValue(mockSelect)
        };

        test('should return list of user chat sessions', async () => {
            ChatSession.find.mockReturnValue(mockSort);

            await chatbotController.getUserChatSessions(mockReq, mockRes);
            
            expect(ChatSession.find).toHaveBeenCalledWith({ user_id: mockUser.userId });
            expect(mockSort.sort).toHaveBeenCalledWith({ updated_at: -1 });
            expect(mockSelect.select).toHaveBeenCalledWith('thread_id title created_at updated_at');
            
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockSessions,
                count: mockSessions.length
            });
        });

        test('should return empty list if no sessions found', async () => {
            const mockSelectEmpty = {
                select: jest.fn().mockResolvedValue([])
            };
            const mockSortEmpty = {
                sort: jest.fn().mockReturnValue(mockSelectEmpty)
            };
            ChatSession.find.mockReturnValue(mockSortEmpty);

            await chatbotController.getUserChatSessions(mockReq, mockRes);
            
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: [],
                count: 0
            });
        });
    });

    // --- deleteChatSession test suite ---
    describe('deleteChatSession', () => {
        const testThreadId = 'thread_999_parent123';

        test('should delete chat session successfully', async () => {
            mockReq.params.threadId = testThreadId;
            
            ChatSession.findOneAndDelete.mockResolvedValue({ thread_id: testThreadId }); // Result must be truthy

            await chatbotController.deleteChatSession(mockReq, mockRes);
            
            expect(ChatSession.findOneAndDelete).toHaveBeenCalledWith({ 
                thread_id: testThreadId, 
                user_id: mockUser.userId 
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Chat session deleted successfully"
            });
        });

        test('should return 404 if chat session not found', async () => {
            mockReq.params.threadId = 'nonexistent';
            
            ChatSession.findOneAndDelete.mockResolvedValue(null);

            await chatbotController.deleteChatSession(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Chat session not found"
            });
        });

        test('should return 400 if threadId is missing', async () => {
            mockReq.params.threadId = undefined;

            await chatbotController.deleteChatSession(mockReq, mockRes);
            
            expect(ChatSession.findOneAndDelete).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Thread ID is required"
            });
        });
    });
});