jest.resetModules();

// Mock dependencies
// Mocking Mongoose Models
jest.mock('../src/models/semesterReport.model', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(), // Used in createSemesterReport
}));

jest.mock('../src/models/child.model', () => ({
    findById: jest.fn(), // Used in createSemesterReport
    find: jest.fn(), // Used in getMyChildSemesterReports
}));

const SemesterReport = require('../src/models/semesterReport.model');
const Child = require('../src/models/child.model');
const semesterReportController = require('../src/controllers/semesterReport.controller');

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

describe('SemesterReport Controller', () => {
    let mockReq, mockRes;

    const mockAdminId = 'admin123';
    const mockTeacherId = 'teacher456';
    const mockParentId = 'parent789';
    const mockChildId = 'child101';
    const mockReportId = 'report202';
    const mockSemester = '2025-1';

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
        name: 'Mr. Bob', 
        email: 'bob@daycare.com' 
    };
    // Report data that has been populated for final result
    const mockReport = {
        _id: mockReportId,
        semester: mockSemester,
        // Mock ID data needed for access control checking in controller
        teacher_id: { _id: mockTeacherId, toString: () => mockTeacherId },
        child_id: { 
            _id: mockChildId, 
            parent_id: { _id: mockParentId, toString: () => mockParentId } 
        },
        // Example semester report data
        religious_moral: {
            berdoa_sebelum_kegiatan: 'Sangat Baik',
            beribadah_sesuai_agama: 'Mulai Berkembang'
        },
        social_emotional: {
            bermain_dengan_teman: 'Sangat Baik'
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

    // Create semester report - Teacher only
    describe('createSemesterReport', () => {
        beforeEach(() => {
            // Setup role and body for Teacher
            mockReq.user.role = 'Teacher';
            mockReq.user.userId = mockTeacherId;
            mockReq.body = {
                child_id: mockChildId,
                semester: mockSemester,
                // Other report data
                religious_moral: { berdoa_sebelum_kegiatan: 'Mulai Berkembang' }
            };
        });

        test('should create semester report successfully', async () => {
            // Mock Mongoose: Child found, Report doesn't exist
            Child.findById.mockResolvedValue(mockChild);
            SemesterReport.findOne.mockResolvedValue(null); 
            SemesterReport.create.mockResolvedValue({ _id: mockReportId }); 
            // Mock findById chain for populate result
            SemesterReport.findById.mockReturnValue(mockPopulateChain(mockReport));

            await semesterReportController.createSemesterReport(mockReq, mockRes);

            expect(SemesterReport.findOne).toHaveBeenCalledWith({ child_id: mockChildId, semester: mockSemester });
            expect(SemesterReport.create).toHaveBeenCalledWith(expect.objectContaining({
                child_id: mockChildId,
                teacher_id: mockTeacherId,
                semester: mockSemester,
            }));
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                report: mockReport
            }));
        });

        // Negative Cases
        test('should return 400 if semester format is invalid (missing dash)', async () => {
            mockReq.body.semester = '20251'; // Invalid format
            
            await semesterReportController.createSemesterReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining("Semester must be in format")
            }));
        });
        
        test('should return 400 if semester format is invalid (wrong number)', async () => {
            mockReq.body.semester = '2025-3'; // Invalid number (must be 1 or 2)
            
            await semesterReportController.createSemesterReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining("Semester must be in format")
            }));
        });

        test('should return 400 if child not found', async () => {
            Child.findById.mockResolvedValue(null);

            await semesterReportController.createSemesterReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Child not found" });
        });

        test('should return 400 if report already exists for the semester', async () => {
            Child.findById.mockResolvedValue(mockChild);
            // Mock SemesterReport.findOne returns duplicate
            SemesterReport.findOne.mockResolvedValue({}); 

            await semesterReportController.createSemesterReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ 
                success: false, 
                message: "Semester report for this child and semester already exists" 
            });
            expect(SemesterReport.create).not.toHaveBeenCalled();
        });
    });

    // Get all semester reports - Admin only
    describe('getAllSemesterReports (Admin only)', () => {
        test('should return all semester reports successfully', async () => {
            const mockReports = [{ _id: 'r1' }, { _id: 'r2' }];
            mockReq.user.role = 'Admin';
            
            // Mock find chain
            SemesterReport.find.mockReturnValue(mockPopulateChain(mockReports));

            await semesterReportController.getAllSemesterReports(mockReq, mockRes);

            expect(SemesterReport.find).toHaveBeenCalledWith();
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, reports: mockReports });
        });
    });

    // Get semester reports by teacher - Teacher only
    describe('getMySemesterReports (Teacher only)', () => {
        test('should return reports created by the current teacher', async () => {
            mockReq.user = { userId: mockTeacherId, role: 'Teacher' };
            const mockReports = [{ _id: 'r1', teacher_id: mockTeacherId }];
            
            // Mock SemesterReport.find chain with teacher_id filter
            SemesterReport.find.mockReturnValue(mockPopulateChain(mockReports));

            await semesterReportController.getMySemesterReports(mockReq, mockRes);

            expect(SemesterReport.find).toHaveBeenCalledWith({ teacher_id: mockTeacherId });
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, reports: mockReports });
        });
    });

    // Get semester reports for my child - Parent only
    describe('getMyChildSemesterReports (Parent only)', () => {
        test('should return reports for all children belonging to the parent', async () => {
            mockReq.user = { userId: mockParentId, role: 'Parent' };
            const myChildren = [
                { _id: mockChildId }, 
                { _id: 'child102' }
            ];
            const mockReports = [{ _id: 'r1' }, { _id: 'r2' }];

            // Mock Child.find to get children IDs
            Child.find.mockResolvedValue(myChildren);
            
            // Mock SemesterReport.find chain with child_id $in filter
            SemesterReport.find.mockReturnValue(mockPopulateChain(mockReports));

            await semesterReportController.getMyChildSemesterReports(mockReq, mockRes);

            expect(Child.find).toHaveBeenCalledWith({ parent_id: mockParentId });
            expect(SemesterReport.find).toHaveBeenCalledWith({ 
                child_id: { $in: [mockChildId, 'child102'] } 
            });
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, reports: mockReports });
        });
    });

    // Get semester report by ID - Access Control Test
    describe('getSemesterReportById (Access Control)', () => {
        
        beforeEach(() => {
            mockReq.params.id = mockReportId;
        });

        test('should get report successfully for Admin', async () => {
            mockReq.user.role = 'Admin';
            
            // Mock findById chain returns report
            SemesterReport.findById.mockReturnValue(mockPopulateChain(mockReport));

            await semesterReportController.getSemesterReportById(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ success: true, report: mockReport });
        });

        test('should deny access if Parent views another Child\'s report (403)', async () => {
            mockReq.user = { userId: 'differentParent', role: 'Parent' }; 

            SemesterReport.findById.mockReturnValue(mockPopulateChain(mockReport));

            await semesterReportController.getSemesterReportById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Access denied" });
        });
        
        test('should deny access if Teacher views another Teacher\'s report (403)', async () => {
            mockReq.user = { userId: 'differentTeacher', role: 'Teacher' }; 

            SemesterReport.findById.mockReturnValue(mockPopulateChain(mockReport));

            await semesterReportController.getSemesterReportById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Access denied" });
        });
    });

    // Partial update for checklist style frontend - Teacher only
    describe('partialUpdateSemesterReport (Teacher only)', () => {
        beforeEach(() => {
            mockReq.params.id = mockReportId;
            mockReq.user = { userId: mockTeacherId, role: 'Teacher' };
            // Mock data for partial update
            mockReq.body = { 
                updates: {
                    'religious_moral.berdoa_sebelum_kegiatan': 'Konsisten',
                    'social_emotional.bermain_dengan_teman': 'Mulai Berkembang'
                }
            };
        });
        
        test('should apply partial updates successfully using $set', async () => {
            // Mock findById for access control check
            SemesterReport.findById.mockResolvedValue({ 
                _id: mockReportId, 
                teacher_id: mockTeacherId.toString() 
            });
            
            // Mock findByIdAndUpdate chain
            SemesterReport.findByIdAndUpdate.mockReturnValue(mockPopulateChain({ 
                ...mockReport,
                religious_moral: { berdoa_sebelum_kegiatan: 'Konsisten' } 
            }));

            await semesterReportController.partialUpdateSemesterReport(mockReq, mockRes);
            
            // Verify update call using $set
            expect(SemesterReport.findByIdAndUpdate).toHaveBeenCalledWith(
                mockReportId,
                { 
                    $set: { 
                        religious_moral: { berdoa_sebelum_kegiatan: 'Konsisten' },
                        social_emotional: { bermain_dengan_teman: 'Mulai Berkembang' }
                    }
                },
                { new: true, runValidators: true }
            );
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: "Semester report updated successfully",
            }));
        });

        test('should deny access if teacher is not the creator (403)', async () => {
            mockReq.user.userId = 'differentTeacher'; // Wrong teacher
            
            SemesterReport.findById.mockResolvedValue({ 
                _id: mockReportId, 
                teacher_id: mockTeacherId.toString() 
            });
            
            await semesterReportController.partialUpdateSemesterReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(SemesterReport.findByIdAndUpdate).not.toHaveBeenCalled();
        });
    });

    // Update semester report - Teacher only (full update)
    describe('updateSemesterReport (Teacher only)', () => {
        beforeEach(() => {
            mockReq.params.id = mockReportId;
            mockReq.user = { userId: mockTeacherId, role: 'Teacher' };
            // Mock data full update
            mockReq.body = {
                semester: '2025-2', // Semester can be changed
                catatan_guru: 'Anak sudah berkembang pesat'
            };
        });
        
        test('should perform full report update successfully', async () => {
            // Mock findById for access control check
            SemesterReport.findById.mockResolvedValue({ 
                _id: mockReportId, 
                teacher_id: mockTeacherId.toString() 
            });
            
            // Mock findByIdAndUpdate chain
            const updatedReport = { ...mockReport, semester: '2025-2', catatan_guru: 'Anak sudah berkembang pesat' };
            SemesterReport.findByIdAndUpdate.mockReturnValue(mockPopulateChain(updatedReport));

            await semesterReportController.updateSemesterReport(mockReq, mockRes);

            // Verify update call
            expect(SemesterReport.findByIdAndUpdate).toHaveBeenCalledWith(
                mockReportId,
                { 
                    semester: '2025-2', 
                    catatan_guru: 'Anak sudah berkembang pesat' 
                },
                { new: true, runValidators: true }
            );
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                report: updatedReport
            }));
        });
    });

    // Delete semester report - Teacher only (own reports)
    describe('deleteSemesterReport (Teacher only - own reports)', () => {
        beforeEach(() => {
            mockReq.params.id = mockReportId;
            mockReq.user = { userId: mockTeacherId, role: 'Teacher' };
        });

        test('should delete report successfully if teacher is the creator', async () => {
            // Mock findById for access control check
            SemesterReport.findById.mockResolvedValue({ 
                _id: mockReportId, 
                teacher_id: mockTeacherId.toString() 
            });
            // Mock findByIdAndDelete
            SemesterReport.findByIdAndDelete.mockResolvedValue({ _id: mockReportId });
            
            await semesterReportController.deleteSemesterReport(mockReq, mockRes);

            expect(SemesterReport.findByIdAndDelete).toHaveBeenCalledWith(mockReportId);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: "Semester report deleted successfully" });
        });

        test('should return 404 if report not found', async () => {
            SemesterReport.findById.mockResolvedValue(null);

            await semesterReportController.deleteSemesterReport(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: "Semester report not found" });
        });
    });
});