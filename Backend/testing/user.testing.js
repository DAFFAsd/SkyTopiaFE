jest.resetModules();

// Mock dependencies
// Mocking Mongoose Models
jest.mock('../src/models/user.model', () => ({
    countDocuments: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    aggregate: jest.fn(),
    // Mock the .select() chain for find and findById
    select: jest.fn().mockReturnThis(), 
}));

jest.mock('../src/models/child.model', () => ({
    countDocuments: jest.fn(),
}));

jest.mock('../src/models/dailyReport.model', () => ({
    countDocuments: jest.fn(),
}));

jest.mock('../src/models/semesterReport.model', () => ({
    countDocuments: jest.fn(),
}));

jest.mock('../src/models/payment.model', () => ({
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
}));

// Mock bcrypt for password hashing/comparison
jest.mock('bcrypt', () => ({
    hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)), // Mock hash
    compare: jest.fn(), // Mock compare
}));

// Mock JWT token generation
jest.mock('../src/middleware/auth', () => ({
    generateToken: jest.fn((payload) => `mock_token_${payload.userId}`),
}));

// Import the mocks and controller (Pastikan path ke controller Anda benar)
const User = require('../src/models/user.model');
const Child = require('../src/models/child.model');
const DailyReport = require('../src/models/dailyReport.model');
const SemesterReport = require('../src/models/semesterReport.model');
const Payment = require('../src/models/payment.model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../src/middleware/auth');
const userController = require('../src/controllers/user.controller'); 

// Helper function untuk mensimulasikan chain .select()
const mockSelectChain = (resolvedValue) => {
    return {
        select: jest.fn().mockResolvedValue(resolvedValue),
    };
};

describe('User Controller', () => {
    let mockReq, mockRes;

    const mockAdminId = 'admin123';
    const mockParentId = 'parent789';
    const mockUserId = 'user999';
    const mockPassword = 'validPassword123';

    const mockUser = (role) => ({
        _id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
        role: role,
        phone: '1234567890',
        password: `hashed_${mockPassword}`,
        createdAt: new Date().toISOString(),
        toString: () => mockUserId, 
    });

    beforeEach(() => {
        // Default Request setup
        mockReq = {
            body: {},
            params: {},
            user: { userId: mockAdminId, role: 'Admin' } // Default Admin
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Reset semua mock sebelum setiap test
        jest.clearAllMocks();
    });

    // First time setup register
    describe('setupAdmin', () => {
        beforeEach(() => {
            mockReq.body = {
                name: 'Super Admin',
                email: 'admin@setup.com',
                password: mockPassword,
                phone: '08123456789'
            };
        });

        test('should create first admin user successfully', async () => {
            User.countDocuments.mockResolvedValue(0);
            const newUser = mockUser('Admin');
            User.create.mockResolvedValue(newUser);

            await userController.setupAdmin(mockReq, mockRes);

            expect(User.countDocuments).toHaveBeenCalled();
            expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
            }));
        });

        test('should return 403 if users already exist', async () => {
            User.countDocuments.mockResolvedValue(1); 

            await userController.setupAdmin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Setup already completed"
            }));
        });

        test('should return 400 if password is too short', async () => {
            mockReq.body.password = 'short';
            User.countDocuments.mockResolvedValue(0); 

            await userController.setupAdmin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Password must be at least 8 characters long"
            }));
        });
    });

    // Register new user - Admin only
    describe('register (Admin only)', () => {
        beforeEach(() => {
            mockReq.body = {
                name: 'New Parent',
                email: 'newparent@example.com',
                password: mockPassword,
                role: 'Parent',
                phone: '0811223344'
            };
        });

        test('should create new user successfully', async () => {
            User.findOne.mockResolvedValue(null);
            const newUser = mockUser('Parent');
            User.create.mockResolvedValue(newUser);

            await userController.register(mockReq, mockRes);

            expect(User.findOne).toHaveBeenCalled();
            expect(bcrypt.hash).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "User registered successfully",
            }));
        });

        test('should return 400 if user with email/phone already exists', async () => {
            User.findOne.mockResolvedValue({}); 

            await userController.register(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "User with this email or phone already exists"
            }));
        });
    });

    // Login user - Public access
    describe('login', () => {
        beforeEach(() => {
            mockReq.body = {
                email: 'test@example.com',
                password: mockPassword
            };
        });

        test('should login user successfully and return token', async () => {
            const adminUser = mockUser('Admin');
            
            User.findOne.mockResolvedValue(adminUser);
            bcrypt.compare.mockResolvedValue(true); 

            await userController.login(mockReq, mockRes);

            expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, adminUser.password);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Login successful",
            }));
        });

        test('should return 401 if user not found', async () => {
            User.findOne.mockResolvedValue(null); 

            await userController.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Invalid email or password"
            }));
        });

        test('should return 401 if password invalid', async () => {
            User.findOne.mockResolvedValue(mockUser('Admin'));
            bcrypt.compare.mockResolvedValue(false); 

            await userController.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Invalid email or password"
            }));
        });
    });

    // Get all users - Admin only
    describe('getAllUsers (Admin only)', () => {
        test('should return all users excluding password', async () => {
            const mockUsers = [mockUser('Admin'), mockUser('Parent')];
            User.find.mockReturnValue(mockSelectChain(mockUsers)); 

            await userController.getAllUsers(mockReq, mockRes);

            expect(User.find).toHaveBeenCalled();
            expect(User.find().select).toHaveBeenCalledWith('-password');
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, users: mockUsers });
        });
    });

    // Get user by ID - Admin only
    describe('getUserById (Admin only)', () => {
        test('should return user by ID excluding password', async () => {
            mockReq.params.id = mockParentId;
            const parentUser = mockUser('Parent');
            parentUser._id = mockParentId;
            
            User.findById.mockReturnValue(mockSelectChain(parentUser)); 

            await userController.getUserById(mockReq, mockRes);

            expect(User.findById).toHaveBeenCalledWith(mockParentId);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, user: parentUser });
        });
    });

    // Get current user profile - all authenticated users
    describe('getProfile (Authenticated)', () => {
        test('should return the profile of the authenticated user (Parent)', async () => {
            mockReq.user = { userId: mockParentId, role: 'Parent' };
            const parentUser = mockUser('Parent');
            parentUser._id = mockParentId;
            
            User.findById.mockReturnValue(mockSelectChain(parentUser)); 

            await userController.getProfile(mockReq, mockRes);

            expect(User.findById).toHaveBeenCalledWith(mockParentId);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, user: parentUser });
        });
    });

    // Update user - Admin only
    describe('updateUser (Admin only)', () => {
        beforeEach(() => {
            mockReq.params.id = mockUserId;
            mockReq.body = {
                name: 'Updated Name',
                phone: '9876543210'
            };
        });

        test('should update user name and phone successfully (no password)', async () => {
            const updatedUser = { ...mockUser('Admin'), name: 'Updated Name', phone: '9876543210' };

            User.findByIdAndUpdate.mockReturnValue(mockSelectChain(updatedUser)); 

            await userController.updateUser(mockReq, mockRes);

            expect(User.findByIdAndUpdate).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, user: updatedUser });
        });

        test('should update password successfully if provided', async () => {
            mockReq.body.password = mockPassword;
            const updatedUser = { ...mockUser('Admin'), password: `hashed_${mockPassword}` };
            
            User.findByIdAndUpdate.mockReturnValue(mockSelectChain(updatedUser)); 

            await userController.updateUser(mockReq, mockRes);

            expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                mockUserId,
                expect.objectContaining({ password: `hashed_${mockPassword}` }), 
                expect.any(Object)
            );
        });

        test('should return 400 if new password is too short', async () => {
            mockReq.body.password = 'short';
            
            await userController.updateUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Password must be at least 8 characters long"
            }));
        });
    });

    // Delete user - Admin only
    describe('deleteUser (Admin only)', () => {
        test('should delete user successfully', async () => {
            mockReq.params.id = mockUserId;
            User.findByIdAndDelete.mockResolvedValue(mockUser('Teacher')); 

            await userController.deleteUser(mockReq, mockRes);

            expect(User.findByIdAndDelete).toHaveBeenCalledWith(mockUserId);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: "User deleted successfully" });
        });

        test('should return 404 if user not found', async () => {
            mockReq.params.id = 'nonExistentId';
            User.findByIdAndDelete.mockResolvedValue(null); 

            await userController.deleteUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "User not found" });
        });
    });

// Get dashboard statistics - Admin only
    describe('getDashboardStats (Admin only)', () => {
        // Mocked values for predictable calculation
        const mockCurrentSemester = '2025-2'; 
        const mockLastSemester = '2025-1';

        // Variable to hold the Date Spy object
        let dateSpy; 

        beforeEach(() => {
            // FIX 1: Mocking Date menggunakan spyOn untuk menghindari RangeError
            const MOCK_DATE = new Date('2025-11-19T10:00:00.000Z');
            if (dateSpy) dateSpy.mockRestore(); // Bersihkan spy lama
            dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => MOCK_DATE);

            // Mock User Statistics (totalChildren, totalParents, totalTeachers, totalAdmins)
            // FIX 2: Mock Child.countDocuments secara berurutan untuk totalChildren dan recent activity
            Child.countDocuments
                .mockResolvedValueOnce(10) // 1. totalChildren
                .mockResolvedValueOnce(10) // 2. newChildrenThisMonth
                .mockResolvedValueOnce(8); // 3. newChildrenLast30Days
            
            // Mock User Count (untuk roles)
            User.countDocuments.mockImplementation((query) => {
                if (query.role === 'Parent') return Promise.resolve(8);
                if (query.role === 'Teacher') return Promise.resolve(2);
                if (query.role === 'Admin') return Promise.resolve(1);
                return Promise.resolve(0); 
            });

            // Mock Semester Reports
            SemesterReport.countDocuments.mockImplementation((query) => {
                if (!query || Object.keys(query).length === 0) return Promise.resolve(5); // totalSemesterReports
                if (query.semester === mockCurrentSemester) return Promise.resolve(3);
                if (query.semester === mockLastSemester) return Promise.resolve(2);
                return Promise.resolve(0);
            });

            // Mock Financial Status
            Payment.countDocuments.mockImplementation((query) => {
                if (query.status === 'Tertunda') return Promise.resolve(15);
                if (query.status === 'Terkirim') return Promise.resolve(5);
                if (query.status === 'Dibayar') return Promise.resolve(100);
                if (query.status === 'Jatuh Tempo') return Promise.resolve(8);
                if (query.status === 'Ditolak') return Promise.resolve(2);
                return Promise.resolve(0);
            });
            
            // Mock Revenue (Aggregate)
            Payment.aggregate.mockResolvedValue([{ _id: null, total: 50000000 }]);
        });

        afterEach(() => {
            // Restore Date mock setelah setiap test
            if (dateSpy) dateSpy.mockRestore();
            jest.clearAllMocks(); 
        });

        test('should calculate and return all dashboard statistics correctly', async () => {
            
            // FIX 3: Re-mock DailyReport count documents (sequential) di dalam test
            DailyReport.countDocuments
                .mockResolvedValueOnce(5)   // todaysDailyReports
                .mockResolvedValueOnce(25)  // thisWeekDailyReports
                .mockResolvedValueOnce(100); // thisMonthDailyReports

            await userController.getDashboardStats(mockReq, mockRes);

            // Verifikasi pemanggilan count documents
            // Child.countDocuments dipanggil 3x (totalChildren, newChildrenThisMonth, newChildrenLast30Days)
            expect(Child.countDocuments).toHaveBeenCalledTimes(3); 
            
            // **PERBAIKAN UTAMA**: User.countDocuments hanya dipanggil 3x (untuk role Parent, Teacher, Admin)
            expect(User.countDocuments).toHaveBeenCalledTimes(3); 
            
            expect(DailyReport.countDocuments).toHaveBeenCalledTimes(3); 
            expect(SemesterReport.countDocuments).toHaveBeenCalledTimes(3); 
            expect(Payment.countDocuments).toHaveBeenCalledTimes(5); // 5 Status Pembayaran
            
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                stats: {
                    // *** TAMBAHKAN BAGIAN USERS DI SINI ***
                    users: {
                        totalAdmins: 1,
                        totalChildren: 10,
                        totalParents: 8,
                        totalTeachers: 2
                    },
                    // ************************************
                    reports: {
                        daily: {
                            today: 5,
                            thisWeek: 25,
                            thisMonth: 100
                        },
                        semester: {
                            total: 5,
                            currentSemester: 3,
                            lastSemester: 2
                        }
                    },
                    // *** PERBAIKAN DI SINI ***
                    financial: {
                        paid: 100, // Dibayar (Paid)
                        totalRevenue: 50000000,
                        overdue: 8, // Jatuh Tempo (Overdue)
                        pending: 15, // Tertunda (Pending)
                        sent: 5, // Terkirim (Sent)
                        rejected: 2 // Ditolak (Rejected)
                    },
                    // ... (bagian activity tetap sama)
                    activity: {
                        newChildrenThisMonth: 10,
                        newChildrenLast30Days: 8
                    }
                }
            }));
            
            expect(Payment.aggregate).toHaveBeenCalledTimes(1);
        });
    });
});