jest.resetModules();

// Mock dependencies
// Mocking Mongoose Models
jest.mock('../src/models/payment.model', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(), // Used in createPayment for duplicate check
    countDocuments: jest.fn(), // Used in getAllPayments for pagination
}));

jest.mock('../src/models/child.model', () => ({
    findById: jest.fn(),
    find: jest.fn(), // Used in getMyChildPayments
}));

// Mocking the scheduler functions (to prevent side effects)
jest.mock('../src/tasks/scheduler', () => ({
    calculateManualDueDate: jest.fn(),
    checkAndUpdateOverdue: jest.fn(),
}));

const Payment = require('../src/models/payment.model');
const Child = require('../src/models/child.model');
const { calculateManualDueDate, checkAndUpdateOverdue } = require('../src/tasks/scheduler');
const paymentController = require('../src/controllers/payment.controller');

describe('Payment Controller', () => {
    let mockReq, mockRes;
    const mockAdminId = 'admin123';
    const mockParentId = 'parent789';
    const mockChildId = 'child456';
    const mockPaymentId = 'pay101';
    
    const mockChild = (monthly_fee, semester_fee) => ({ 
        _id: mockChildId, 
        name: 'Test Child', 
        monthly_fee: monthly_fee, 
        semester_fee: semester_fee,
        parent_id: mockParentId
    });

    // Helper function for mocking a successful payment populated chain
    const mockPopulateChain = (resolvedValue) => {
        // Define the final resolved mock value for find/findById/etc.
        const resolvedMock = Promise.resolve(resolvedValue);

        // Define a base mock object that can chain itself (find, sort, skip, limit)
        const chainableMock = {
            populate: jest.fn().mockReturnThis(), // Returns itself for chaining
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            
            // This handles find, findOne, findById
            exec: jest.fn().mockResolvedValue(resolvedValue),
            // This handles Mongoose query methods that return a promise directly
            then: jest.fn(function (cb) { return resolvedMock.then(cb); }),
            // For findById/findOne methods that return the actual document
            lean: jest.fn().mockResolvedValue(resolvedValue),
            
            // Handling the specific findByIdAndUpdate structure with nested populates
            findByIdAndUpdate: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(resolvedValue)
                })
            })
        };

        // Fix the initial populate reference
        chainableMock.populate = jest.fn().mockReturnThis();

        return chainableMock;
    };

    beforeEach(() => {
        // Default Request setup (Admin for creation/update/delete)
        mockReq = {
            body: {},
            params: {},
            query: {},
            user: { userId: mockAdminId, role: 'Admin' }, 
            file: undefined // For proof submission
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Reset all mocks
        jest.clearAllMocks();

        // Default mock for scheduler functions (required in many endpoints)
        checkAndUpdateOverdue.mockResolvedValue();
        calculateManualDueDate.mockReturnValue(new Date(Date.now() + 86400000)); // Default to tomorrow
    });

    // Create Payment - Admin Only
    describe('createPayment', () => {
        
        // Mock a successful creation sequence
        const setupSuccessMocks = (childData, category, amount) => {
            Child.findById.mockResolvedValue(mockChild(childData.monthly_fee, childData.semester_fee));
            Payment.findOne.mockResolvedValue(null); // No duplicates
            Payment.create.mockResolvedValue({ _id: mockPaymentId });
            
            const populatedPayment = { 
                _id: mockPaymentId, 
                category, 
                amount, 
                child_id: { name: 'Test Child' } 
            };
            Payment.findById.mockReturnValue(mockPopulateChain(populatedPayment));
        };

        test('should create Monthly payment successfully', async () => {
            setupSuccessMocks({ monthly_fee: 500000, semester_fee: 2000000 }, 'Bulanan', 500000);
            mockReq.body = { child_id: mockChildId, category: 'Bulanan', period: '2025-11' };

            await paymentController.createPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(Payment.create).toHaveBeenCalledWith(expect.objectContaining({ 
                amount: 500000, 
                category: 'Bulanan' 
            }));
        });
        
        test('should create Semester payment successfully', async () => {
            setupSuccessMocks({ monthly_fee: 500000, semester_fee: 2000000 }, 'Semester', 2000000);
            mockReq.body = { child_id: mockChildId, category: 'Semester', period: 'Semester Ganjil 2025/2026' };

            await paymentController.createPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(Payment.create).toHaveBeenCalledWith(expect.objectContaining({ 
                amount: 2000000, 
                category: 'Semester' 
            }));
        });
        
        test('should create Registration payment successfully with manual amount', async () => {
            setupSuccessMocks({ monthly_fee: 500000, semester_fee: 2000000 }, 'Registrasi', 1500000);
            mockReq.body = { child_id: mockChildId, category: 'Registrasi', amount: 1500000 };

            await paymentController.createPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(Payment.create).toHaveBeenCalledWith(expect.objectContaining({ 
                amount: 1500000, 
                category: 'Registrasi' 
            }));
        });

        test('should use manual due_date if provided (in the future)', async () => {
            const futureDate = new Date(Date.now() + 86400000 * 2).toISOString();
            setupSuccessMocks({ monthly_fee: 500000, semester_fee: 2000000 }, 'Bulanan', 500000);
            mockReq.body = { child_id: mockChildId, category: 'Bulanan', period: '2025-11', due_date: futureDate };

            await paymentController.createPayment(mockReq, mockRes);

            expect(Payment.create).toHaveBeenCalledWith(expect.objectContaining({ 
                due_date: new Date(futureDate) 
            }));
        });
        
        // Negative Cases
        test('should return 400 if child not found', async () => {
            Child.findById.mockResolvedValue(null);
            mockReq.body = { child_id: 'nonExistent', category: 'Bulanan', period: '2025-11' };

            await paymentController.createPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Child not found" });
        });

        test('should return 400 if monthly fee is not set for Monthly payment', async () => {
            Child.findById.mockResolvedValue(mockChild(0, 2000000)); // monthly_fee = 0
            mockReq.body = { child_id: mockChildId, category: 'Bulanan', period: '2025-11' };

            await paymentController.createPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "No Bulanan fee set for this child" });
        });

        test('should return 400 if amount is missing for Registration payment', async () => {
            Child.findById.mockResolvedValue(mockChild(500000, 2000000));
            mockReq.body = { child_id: mockChildId, category: 'Registrasi', amount: 0 };

            await paymentController.createPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Amount is required for registration payments" });
        });
        
        test('should return 400 if payment for period already exists', async () => {
            Child.findById.mockResolvedValue(mockChild(500000, 2000000));
            Payment.findOne.mockResolvedValue({}); // Duplicate exists
            mockReq.body = { child_id: mockChildId, category: 'Bulanan', period: '2025-11' };

            await paymentController.createPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
                message: "Payment for Bulanan period 2025-11 already exists" 
            }));
        });

        test('should return 400 if due_date is in the past', async () => {
            const pastDate = new Date(Date.now() - 86400000).toISOString();
            setupSuccessMocks({ monthly_fee: 500000, semester_fee: 2000000 }, 'Bulanan', 500000);
            mockReq.body = { child_id: mockChildId, category: 'Bulanan', period: '2025-11', due_date: pastDate };

            await paymentController.createPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Due date must be in the future" });
        });
    });

    // Get All Payments - Admin Only
    describe('getAllPayments', () => {
        test('should return all payments with pagination and filters applied', async () => {
            const mockPayments = [{ _id: mockPaymentId }];
            Payment.find.mockReturnValue(mockPopulateChain(mockPayments));
            Payment.countDocuments.mockResolvedValue(25); 

            mockReq.query = { 
                status: 'Tertunda', 
                category: 'Bulanan', 
                child_id: mockChildId, 
                page: 2, 
                limit: 10 
            };

            await paymentController.getAllPayments(mockReq, mockRes);
            
            expect(checkAndUpdateOverdue).toHaveBeenCalled();
            expect(Payment.find).toHaveBeenCalledWith({
                status: 'Tertunda',
                category: 'Bulanan',
                child_id: mockChildId
            });
            expect(Payment.countDocuments).toHaveBeenCalledWith({
                status: 'Tertunda',
                category: 'Bulanan',
                child_id: mockChildId
            });
            // Should skip 10 (page 2, limit 10)
            expect(Payment.find().sort).toHaveBeenCalled();
            expect(Payment.find().sort().skip).toHaveBeenCalledWith(10); 
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                payments: mockPayments,
                pagination: { page: 2, limit: 10, total: 25, pages: 3 }
            }));
        });
    });

    // Get Payments by Child ID - Admin Only
    describe('getPaymentsByChildId', () => {
        test('should return all payments for a specific child', async () => {
            Child.findById.mockResolvedValue(mockChild());
            const mockPayments = [{ _id: 'p1' }, { _id: 'p2' }];
            Payment.find.mockReturnValue(mockPopulateChain(mockPayments));

            mockReq.params.childId = mockChildId;

            await paymentController.getPaymentsByChildId(mockReq, mockRes);

            expect(checkAndUpdateOverdue).toHaveBeenCalled();
            expect(Child.findById).toHaveBeenCalledWith(mockChildId);
            expect(Payment.find).toHaveBeenCalledWith({ child_id: mockChildId });
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, payments: mockPayments });
        });
    });

    // Get My Child Payments - Parent Only
    describe('getMyChildPayments', () => {
        test('should return payments for all children belonging to the parent', async () => {
            mockReq.user = { userId: mockParentId, role: 'Parent' };
            const myChildren = [
                { _id: 'child1', parent_id: mockParentId },
                { _id: 'child2', parent_id: mockParentId }
            ];
            const mockPayments = [{ _id: 'p1', child_id: 'child1' }];

            Child.find.mockResolvedValue(myChildren);
            Payment.find.mockReturnValue(mockPopulateChain(mockPayments));

            await paymentController.getMyChildPayments(mockReq, mockRes);

            expect(checkAndUpdateOverdue).toHaveBeenCalled();
            expect(Child.find).toHaveBeenCalledWith({ parent_id: mockParentId });
            expect(Payment.find).toHaveBeenCalledWith({ child_id: { $in: ['child1', 'child2'] } });
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, payments: mockPayments });
        });
    });

    // Get Payment by ID (Access Control Test)
    describe('getPaymentById', () => {
        const mockPaymentData = (childParentId) => ({
            _id: mockPaymentId,
            child_id: { _id: mockChildId, parent_id: childParentId.toString() }
        });
        
        test('should get payment successfully for Admin', async () => {
            mockReq.params.id = mockPaymentId;
            mockReq.user.role = 'Admin';
            const payment = mockPaymentData(mockParentId);
            
            Payment.findById.mockReturnValue(mockPopulateChain(payment));

            await paymentController.getPaymentById(mockReq, mockRes);
            
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, payment });
        });
        
        test('should get payment successfully for the Child\'s Parent', async () => {
            mockReq.params.id = mockPaymentId;
            mockReq.user = { userId: mockParentId, role: 'Parent' };
            const payment = mockPaymentData(mockParentId);
            
            Payment.findById.mockReturnValue(mockPopulateChain(payment));

            await paymentController.getPaymentById(mockReq, mockRes);
            
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, payment });
        });

        test('should deny access if Parent views another Child\'s payment', async () => {
            mockReq.params.id = mockPaymentId;
            mockReq.user = { userId: 'differentParent', role: 'Parent' };
            const payment = mockPaymentData(mockParentId); 
            
            Payment.findById.mockReturnValue(mockPopulateChain(payment));

            await paymentController.getPaymentById(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Access denied" });
        });
    });

    // Submit Proof of Payment - Parent Only
    describe('submitProofOfPayment', () => {
        const mockPendingPayment = {
            _id: mockPaymentId,
            status: 'Tertunda',
            child_id: { parent_id: mockParentId.toString() }
        };

        test('should submit proof successfully and change status to Terkirim', async () => {
            mockReq.params.id = mockPaymentId;
            mockReq.user = { userId: mockParentId, role: 'Parent' };
            mockReq.file = { path: 'https://cloudinary.com/proof.jpg' };
            
            // Mock the initial findById (for validation)
            Payment.findById.mockReturnValue(mockPopulateChain(mockPendingPayment));
            
            // Mock the final update call
            const mockUpdatedDoc = { status: 'Terkirim', child_id: mockPendingPayment.child_id };
            Payment.findByIdAndUpdate.mockReturnValue({ 
                populate: jest.fn().mockResolvedValue(mockUpdatedDoc) 
            });
            
            await paymentController.submitProofOfPayment(mockReq, mockRes);

            expect(Payment.findByIdAndUpdate).toHaveBeenCalledWith(
                mockPaymentId,
                { proof_of_payment_url: 'https://cloudinary.com/proof.jpg', status: "Terkirim" },
                { new: true, runValidators: true }
            );
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
                success: true, 
                message: "Proof of payment submitted successfully" 
            }));
        });

        test('should return 400 if file is missing', async () => {
            mockReq.file = null; 

            await paymentController.submitProofOfPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Proof of payment file is required" });
        });
        
        test('should return 400 if payment is already Dibayar', async () => {
            mockReq.params.id = mockPaymentId;
            mockReq.file = { path: 'https://cloudinary.com/proof.jpg' };
            const paidPayment = { ...mockPendingPayment, status: 'Dibayar' };

            Payment.findById.mockReturnValue(mockPopulateChain(paidPayment));

            await paymentController.submitProofOfPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ 
                message: "Cannot submit proof for payment with Dibayar status" 
            }));
        });
    });

    // Update Payment Status - Admin Only
    describe('updatePaymentStatus', () => {
        const mockFoundPayment = { _id: mockPaymentId };
        
        test('should update status to Dibayar and set paid_at', async () => {
            mockReq.params.id = mockPaymentId;
            mockReq.body = { status: 'Dibayar' };
            
            Payment.findByIdAndUpdate.mockReturnValue(mockPopulateChain({ status: 'Dibayar', paid_at: new Date() }));

            await paymentController.updatePaymentStatus(mockReq, mockRes);

            expect(Payment.findByIdAndUpdate).toHaveBeenCalledWith(
                mockPaymentId,
                expect.objectContaining({ status: 'Dibayar', paid_at: expect.any(Date), rejection_reason: null }),
                expect.any(Object)
            );
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        test('should update status to Ditolak and set rejection_reason', async () => {
            mockReq.params.id = mockPaymentId;
            mockReq.body = { status: 'Ditolak', rejection_reason: 'Foto blur' };
            
            Payment.findByIdAndUpdate.mockReturnValue(mockPopulateChain({ status: 'Ditolak', rejection_reason: 'Foto blur' }));

            await paymentController.updatePaymentStatus(mockReq, mockRes);

            expect(Payment.findByIdAndUpdate).toHaveBeenCalledWith(
                mockPaymentId,
                expect.objectContaining({ status: 'Ditolak', rejection_reason: 'Foto blur' }),
                expect.any(Object)
            );
        });

        test('should return 400 if rejection_reason is missing when rejecting', async () => {
            mockReq.body = { status: 'Ditolak' }; // Missing rejection_reason
            
            await paymentController.updatePaymentStatus(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Rejection reason is required when rejecting payment" });
        });
    });

    // Delete Payment - Admin Only
    describe('deletePayment', () => {
        
        test('should delete pending payment successfully', async () => {
            mockReq.params.id = mockPaymentId;
            Payment.findById.mockResolvedValue({ _id: mockPaymentId, status: 'Tertunda' });
            Payment.findByIdAndDelete.mockResolvedValue({ _id: mockPaymentId });

            await paymentController.deletePayment(mockReq, mockRes);

            expect(Payment.findByIdAndDelete).toHaveBeenCalledWith(mockPaymentId);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: "Payment deleted successfully" });
        });

        test('should return 400 if trying to delete a paid payment', async () => {
            mockReq.params.id = mockPaymentId;
            Payment.findById.mockResolvedValue({ _id: mockPaymentId, status: 'Dibayar' });

            await paymentController.deletePayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Cannot delete paid payments" });
            expect(Payment.findByIdAndDelete).not.toHaveBeenCalled();
        });
    });

    // Error Handler Test (General)
    describe('General Error Handling', () => {
        test('should return 500 on server error in createPayment', async () => {
            Child.findById.mockRejectedValue(new Error('DB connection error'));

            await paymentController.createPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'DB connection error' });
        });
    });
});