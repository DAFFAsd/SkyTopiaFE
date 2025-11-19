jest.resetModules();

// Mock dependencies
// Mocking Mongoose Models
jest.mock('../src/models/dailyReport.model', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

jest.mock('../src/models/child.model', () => ({
    findById: jest.fn(),
    find: jest.fn()
}));

const DailyReport = require('../src/models/dailyReport.model');
const Child = require('../src/models/child.model');
const dailyReportController = require('../src/controllers/dailyReport.controller');

// Helper function to simulate .populate().populate() chain
const mockPopulateChain = (mockResolvedValue) => {
    // This function will be called second time (populating teacher_id)
    const finalPopulate = jest.fn().mockResolvedValue(mockResolvedValue);
    
    // This returns an object that has populate function, which then returns another populate chain
    const secondPopulate = {
        populate: finalPopulate // This will execute the second populate
    };
    
    // This is the beginning of the chain: populate('child_id', ...)
    return {
        populate: jest.fn().mockReturnValue(secondPopulate) 
    };
};

describe('DailyReport Controller', () => {
    let mockReq, mockRes;

    const mockAdminId = 'admin123';
    const mockTeacherId = 'teacher456';
    const mockParentId = 'parent789';
    const mockChildId = 'child101';
    const mockReportId = 'report202';

    // Basic mock data
    const mockChild = { 
        _id: mockChildId, 
        name: 'Test Child', 
        birth_date: '2022-01-01', 
        gender: 'Female', 
        parent_id: mockParentId 
    };
    const mockTeacher = { 
        _id: mockTeacherId, 
        name: 'Ms. Alice', 
        email: 'alice@daycare.com' 
    };
    // Report data that has been populated for final result
    const mockReport = {
        _id: mockReportId,
        date: '2025-11-19',
        // Mock ID data needed for access control checking in controller
        teacher_id: { _id: mockTeacherId, toString: () => mockTeacherId },
        child_id: { 
            _id: mockChildId, 
            parent_id: { _id: mockParentId, toString: () => mockParentId } 
        }
    };
    
    beforeEach(() => {
        // Default Request setup (Admin for default role)
        mockReq = {
            body: {},
            params: {},
            user: { userId: mockAdminId, role: 'Admin' }
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    // Create daily report - Teacher only
    describe('createDailyReport', () => {
        beforeEach(() => {
            // Setup role and body for Teacher
            mockReq.user.role = 'Teacher';
            mockReq.user.userId = mockTeacherId;
            mockReq.body = {
                child_id: mockChildId,
                date: '2025-11-19',
                theme: 'Colors',
                physical_motor: 'Good',
                meals: 'Ate well',
                nap_duration: '60 minutes',
            };
        });

        test('should create daily report successfully', async () => {
            // Mock Child.findById for child verification
            Child.findById.mockResolvedValue(mockChild);
            // Mock DailyReport.create
            DailyReport.create.mockResolvedValue({ _id: mockReportId }); 
            // Mock DailyReport.findById chain for populate result
            DailyReport.findById.mockReturnValue(mockPopulateChain(mockReport));

            await dailyReportController.createDailyReport(mockReq, mockRes);

            // Verify function calls
            expect(DailyReport.create).toHaveBeenCalledWith(expect.objectContaining({
                child_id: mockChildId,
                teacher_id: mockTeacherId
            }));
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                report: mockReport
            }));
        });

        test('should return 400 if child not found', async () => {
            // Mock Child.findById returns null
            Child.findById.mockResolvedValue(null);

            await dailyReportController.createDailyReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(DailyReport.create).not.toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Child not found" });
        });
        
        test('should return 500 on server error', async () => {
            Child.findById.mockResolvedValue(mockChild);
            // Mock DailyReport.create fails
            DailyReport.create.mockRejectedValue(new Error('DB creation error'));

            await dailyReportController.createDailyReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false, 
                message: 'DB creation error'
            }));
        });
    });

    // Get all daily reports - Admin only
    describe('getAllDailyReports (Admin only)', () => {
        test('should return all daily reports successfully', async () => {
            const mockReports = [{ _id: 'r1' }, { _id: 'r2' }];
            // Mock DailyReport.find chain
            DailyReport.find.mockReturnValue(mockPopulateChain(mockReports));

            await dailyReportController.getAllDailyReports(mockReq, mockRes);

            expect(DailyReport.find).toHaveBeenCalledWith();
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, reports: mockReports });
        });
    });

    // Get daily reports by teacher - Teacher only
    describe('getMyDailyReports (Teacher only)', () => {
        test('should return reports created by the current teacher', async () => {
            // Setup Teacher role
            mockReq.user = { userId: mockTeacherId, role: 'Teacher' };
            const mockReports = [{ _id: 'r1', teacher_id: mockTeacherId }];
            
            // Mock DailyReport.find chain with teacher_id filter
            DailyReport.find.mockReturnValue(mockPopulateChain(mockReports));

            await dailyReportController.getMyDailyReports(mockReq, mockRes);

            expect(DailyReport.find).toHaveBeenCalledWith({ teacher_id: mockTeacherId });
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, reports: mockReports });
        });
    });

    // Get daily reports for my child - Parent only
    describe('getMyChildReports (Parent only)', () => {
        test('should return reports for all children belonging to the parent', async () => {
            // Setup Parent role
            mockReq.user = { userId: mockParentId, role: 'Parent' };
            const anotherChildId = 'child102';
            
            // Mock Child.find to get children IDs
            const mockChildren = [
                { _id: mockChildId }, 
                { _id: anotherChildId }
            ];
            const mockReports = [{ _id: 'r1' }, { _id: 'r2' }];

            Child.find.mockResolvedValue(mockChildren);
            
            // Mock DailyReport.find chain with child_id $in filter
            DailyReport.find.mockReturnValue(mockPopulateChain(mockReports));

            await dailyReportController.getMyChildReports(mockReq, mockRes);

            expect(Child.find).toHaveBeenCalledWith({ parent_id: mockParentId });
            expect(DailyReport.find).toHaveBeenCalledWith({ 
                child_id: { $in: [mockChildId, anotherChildId] } 
            });
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, reports: mockReports });
        });
    });

    // Get daily report by ID - Access Control Test
    describe('getDailyReportById (Access Control)', () => {
        
        beforeEach(() => {
            mockReq.params.id = mockReportId;
        });

        test('should get report successfully for Admin', async () => {
            mockReq.user.role = 'Admin';
            
            // Mock findById chain returns report
            DailyReport.findById.mockReturnValue(mockPopulateChain(mockReport));

            await dailyReportController.getDailyReportById(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ success: true, report: mockReport });
        });

        test('should get report successfully for the Report Creator Teacher', async () => {
            // Correct Teacher
            mockReq.user = { userId: mockTeacherId, role: 'Teacher' }; 
            
            DailyReport.findById.mockReturnValue(mockPopulateChain(mockReport));

            await dailyReportController.getDailyReportById(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ success: true, report: mockReport });
        });
        
        test('should deny access if Teacher views another Teacher\'s report (403)', async () => {
            // Different Teacher
            mockReq.user = { userId: 'differentTeacher', role: 'Teacher' }; 

            DailyReport.findById.mockReturnValue(mockPopulateChain(mockReport));

            await dailyReportController.getDailyReportById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Access denied" });
        });
        
        test('should get report successfully for the Child\'s Parent', async () => {
            // Correct Parent
            mockReq.user = { userId: mockParentId, role: 'Parent' }; 
            
            DailyReport.findById.mockReturnValue(mockPopulateChain(mockReport)); 

            await dailyReportController.getDailyReportById(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ success: true, report: mockReport });
        });
        
        test('should deny access if Parent views another Child\'s report (403)', async () => {
            // Wrong Parent
            mockReq.user = { userId: 'differentParent', role: 'Parent' }; 

            DailyReport.findById.mockReturnValue(mockPopulateChain(mockReport));

            await dailyReportController.getDailyReportById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Access denied" });
        });
    });

    // Update daily report - Teacher only (own reports)
    describe('updateDailyReport (Teacher only - own reports)', () => {
        beforeEach(() => {
            // Setup role and params
            mockReq.params.id = mockReportId;
            mockReq.user = { userId: mockTeacherId, role: 'Teacher' };
            mockReq.body = { theme: 'New Theme', nap_duration: '75 minutes' };
        });
        
        const updatedReportMock = { 
            ...mockReport, 
            theme: 'New Theme', 
            nap_duration: '75 minutes' 
        };

        test('should update report successfully if teacher is the creator', async () => {
            // Mock findById for access control check
            DailyReport.findById.mockResolvedValue({ 
                _id: mockReportId, 
                teacher_id: mockTeacherId.toString() 
            });
            
            // Mock findByIdAndUpdate chain for update
            DailyReport.findByIdAndUpdate.mockReturnValue(mockPopulateChain(updatedReportMock));

            await dailyReportController.updateDailyReport(mockReq, mockRes);

            // Verify update call
            expect(DailyReport.findByIdAndUpdate).toHaveBeenCalledWith(
                mockReportId,
                expect.objectContaining({ theme: 'New Theme', nap_duration: '75 minutes' }),
                { new: true, runValidators: true }
            );
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: "Daily report updated successfully",
                report: updatedReportMock
            }));
        });

        test('should deny access if teacher is not the creator (403)', async () => {
            mockReq.user.userId = 'differentTeacher'; // Wrong teacher
            
            DailyReport.findById.mockResolvedValue({ 
                _id: mockReportId, 
                teacher_id: mockTeacherId.toString() // Report belongs to teacher456
            });
            
            await dailyReportController.updateDailyReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(DailyReport.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Access denied" });
        });
    });

    // Delete daily report - Teacher only (own reports)
    describe('deleteDailyReport (Teacher only - own reports)', () => {
        beforeEach(() => {
            // Setup role and params
            mockReq.params.id = mockReportId;
            mockReq.user = { userId: mockTeacherId, role: 'Teacher' };
        });

        test('should delete report successfully if teacher is the creator', async () => {
            // Mock findById for access control check
            DailyReport.findById.mockResolvedValue({ 
                _id: mockReportId, 
                teacher_id: mockTeacherId.toString() 
            });
            // Mock findByIdAndDelete
            DailyReport.findByIdAndDelete.mockResolvedValue({ _id: mockReportId });
            
            await dailyReportController.deleteDailyReport(mockReq, mockRes);

            expect(DailyReport.findByIdAndDelete).toHaveBeenCalledWith(mockReportId);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: "Daily report deleted successfully" });
        });

        test('should deny access if teacher is not the creator (403)', async () => {
            mockReq.user.userId = 'differentTeacher'; // Wrong teacher
            
            DailyReport.findById.mockResolvedValue({ 
                _id: mockReportId, 
                teacher_id: mockTeacherId.toString() 
            });
            
            await dailyReportController.deleteDailyReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(DailyReport.findByIdAndDelete).not.toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Access denied" });
        });
    });
});