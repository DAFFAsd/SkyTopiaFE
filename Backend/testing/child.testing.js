jest.resetModules();

// Mock dependencies
// Ensure paths are correct for project structure
jest.mock('../src/models/child.model', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

jest.mock('../src/models/user.model', () => ({
    findById: jest.fn(),
    find: jest.fn()
}));

const Child = require('../src/models/child.model');
const User = require('../src/models/user.model');
const childController = require('../src/controllers/child.controller');

describe('Child Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            query: {},
            user: { userId: 'user123', role: 'admin' }
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    // createChild test suite
    describe('createChild', () => {
        const mockParent = {
            _id: 'parent123',
            role: 'Parent',
            name: 'Test Parent',
            email: 'parent@test.com',
            phone: '123456789'
        };

        const mockCreatedChild = { 
            _id: 'child123',
            name: 'Test Child',
            birth_date: '2020-01-01',
            gender: 'Male',
            medical_notes: 'No allergies',
            // ... other fields
            schedules: []
        };
        
        const mockPopulatedChild = {
            ...mockCreatedChild,
            parent_id: mockParent,
        };

        test('should create child successfully', async () => {
            mockReq.body = {
                name: 'Test Child',
                birth_date: '2020-01-01',
                gender: 'Male',
                parent_id: 'parent123',
                medical_notes: 'No allergies',
                monthly_fee: 1000000,
                semester_fee: 5000000
            };

            User.findById.mockResolvedValue(mockParent);
            Child.create.mockResolvedValue({ _id: 'child123' }); 
            
            // Mock Child findById for populate chain
            const finalPopulate = jest.fn().mockResolvedValue(mockPopulatedChild);
            const firstPopulate = {
                // First populate returns object for second populate
                populate: jest.fn().mockReturnValue({
                    populate: finalPopulate 
                })
            };
            Child.findById.mockReturnValue(firstPopulate);

            await childController.createChild(mockReq, mockRes);

            expect(User.findById).toHaveBeenCalledWith('parent123');
            expect(Child.create).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Child created successfully",
                child: mockPopulatedChild
            });
        });

        test('should return 400 if parent is invalid', async () => {
            mockReq.body = { parent_id: 'invalidId' };
            User.findById.mockResolvedValue(null); 

            await childController.createChild(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ 
                success: false, 
                message: "Invalid parent ID or user is not a parent" 
            });
            expect(Child.create).not.toHaveBeenCalled();
        });
    });

    // getAllChildren test suite
    describe('getAllChildren', () => {
        test('should get all children successfully', async () => {
            const mockChildren = [
                { _id: 'child1', name: 'Child 1', parent_id: { name: 'Parent 1' }, schedules: [] }
            ];

            // Mock double populate chain
            const secondPopulate = {
                populate: jest.fn().mockResolvedValue(mockChildren)
            };
            const firstPopulate = {
                populate: jest.fn().mockReturnValue(secondPopulate)
            };
            Child.find.mockReturnValue(firstPopulate);

            await childController.getAllChildren(mockReq, mockRes);

            expect(Child.find).toHaveBeenCalledWith();
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                children: mockChildren
            });
        });
    });

    // getChildById test suite
    describe('getChildById', () => {
        test('should get child by ID successfully Admin access', async () => {
            mockReq.params.id = 'child123';
            mockReq.user.role = 'Admin'; 

            const mockChild = {
                _id: 'child123',
                name: 'Test Child',
                parent_id: { _id: 'parent123', name: 'Test Parent' },
                schedules: []
            };

            // Mock double populate chain
            const secondPopulate = {
                populate: jest.fn().mockResolvedValue(mockChild)
            };
            const firstPopulate = {
                populate: jest.fn().mockReturnValue(secondPopulate)
            };
            Child.findById.mockReturnValue(firstPopulate);

            await childController.getChildById(mockReq, mockRes);

            expect(Child.findById).toHaveBeenCalledWith('child123');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                child: mockChild
            });
        });
        
        test('should deny access if Parent tries to view another child', async () => {
            mockReq.params.id = 'child123';
            mockReq.user = { userId: 'differentParent', role: 'Parent' }; 

            const mockChild = {
                _id: 'child123',
                name: 'Test Child',
                parent_id: { _id: 'parent123', name: 'Test Parent' },
                schedules: []
            };

            // Mock double populate chain
            const secondPopulate = {
                populate: jest.fn().mockResolvedValue(mockChild)
            };
            const firstPopulate = {
                populate: jest.fn().mockReturnValue(secondPopulate)
            };
            Child.findById.mockReturnValue(firstPopulate);

            await childController.getChildById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: "Access denied"
            });
        });
    });

    // getMyChildren test suite
    describe('getMyChildren', () => {
        test('should get my children successfully', async () => {
            mockReq.user = { userId: 'parent123', role: 'Parent' };
            
            const mockChildren = [
                { _id: 'child1', name: 'My Child 1', schedules: [] },
                { _id: 'child2', name: 'My Child 2', schedules: [] }
            ];

            // Mock Child find for populate
            const mockPopulate = {
                populate: jest.fn().mockResolvedValue(mockChildren) 
            };
            Child.find.mockReturnValue(mockPopulate);

            await childController.getMyChildren(mockReq, mockRes);

            expect(Child.find).toHaveBeenCalledWith({ parent_id: 'parent123' });
            expect(mockPopulate.populate).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                children: mockChildren
            });
        });
    });

    // updateChild test suite
    describe('updateChild', () => {
        test('should update child successfully', async () => {
            mockReq.params.id = 'child123';
            mockReq.body = {
                name: 'Updated Child',
                gender: 'Female'
            };

            const mockUpdatedChild = {
                _id: 'child123',
                name: 'Updated Child',
                gender: 'Female',
                parent_id: { name: 'Test Parent' },
                schedules: []
            };

            const updateFields = {
                name: 'Updated Child',
                birth_date: undefined,
                gender: 'Female',
                parent_id: undefined,
                medical_notes: undefined,
                monthly_fee: undefined,
                semester_fee: undefined,
                schedules: undefined
            };

            // Mock double populate chain
            const secondPopulate = {
                populate: jest.fn().mockResolvedValue(mockUpdatedChild)
            };
            const firstPopulate = {
                populate: jest.fn().mockReturnValue(secondPopulate)
            };
            Child.findByIdAndUpdate.mockReturnValue(firstPopulate);

            await childController.updateChild(mockReq, mockRes);

            expect(Child.findByIdAndUpdate).toHaveBeenCalledWith(
                'child123',
                updateFields,
                { new: true, runValidators: true }
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Child updated successfully",
                child: mockUpdatedChild
            });
        });
    });

    // searchChildren test suite
    describe('searchChildren', () => {
        const mockChildren = [
            { _id: 'child1', name: 'Test Child 1', parent_id: { name: 'Parent 1' }, schedules: [] }
        ];

        test('should search children successfully by name or parent name', async () => {
            mockReq.query.search = 'test';
            
            // Mock User find select
            const selectChain = {
                select: jest.fn().mockResolvedValue([{ _id: 'parent123' }]) 
            };
            User.find.mockReturnValue(selectChain); 
            
            // Mock Child find with 2 level populate
            const finalPopulate = jest.fn().mockResolvedValue(mockChildren);
            const firstPopulate = {
                populate: jest.fn().mockReturnValue({
                    populate: finalPopulate
                })
            };
            Child.find.mockReturnValue(firstPopulate);

            await childController.searchChildren(mockReq, mockRes);

            expect(User.find).toHaveBeenCalled();
            expect(Child.find).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                count: 1,
                children: mockChildren
            });
        });

        test('should return 400 if search query is missing', async () => {
            mockReq.query.search = '';

            await childController.searchChildren(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: "Search query is required"
            });
            expect(Child.find).not.toHaveBeenCalled();
        });
    });
    
    // addScheduleToChild test suite
    describe('addScheduleToChild', () => {
        test('should add schedule to child successfully', async () => {
            mockReq.body = { childId: 'child123', scheduleId: 'sch456' };

            const mockChild = { _id: 'child123', schedules: [{ _id: 'sch456', title: 'Math' }] };

            const populateChain = {
                populate: jest.fn().mockResolvedValue(mockChild)
            };
            Child.findByIdAndUpdate.mockReturnValue(populateChain);

            await childController.addScheduleToChild(mockReq, mockRes);

            expect(Child.findByIdAndUpdate).toHaveBeenCalledWith(
                'child123',
                { $addToSet: { schedules: 'sch456' } },
                { new: true }
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Schedule added to child successfully",
                child: mockChild
            });
        });
    });

    // removeScheduleFromChild test suite
    describe('removeScheduleFromChild', () => {
        test('should remove schedule from child successfully', async () => {
            mockReq.body = { childId: 'child123', scheduleId: 'sch456' };

            const mockChild = { _id: 'child123', schedules: [] };

            const populateChain = {
                populate: jest.fn().mockResolvedValue(mockChild)
            };
            Child.findByIdAndUpdate.mockReturnValue(populateChain);

            await childController.removeScheduleFromChild(mockReq, mockRes);

            expect(Child.findByIdAndUpdate).toHaveBeenCalledWith(
                'child123',
                { $pull: { schedules: 'sch456' } },
                { new: true }
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Schedule removed from child successfully",
                child: mockChild
            });
        });
    });

    // deleteChild test suite
    describe('deleteChild', () => {
        test('should delete child successfully', async () => {
            mockReq.params.id = 'child123';
            
            const mockChild = { _id: 'child123', name: 'Test Child' };
            Child.findByIdAndDelete.mockResolvedValue(mockChild);

            await childController.deleteChild(mockReq, mockRes);

            expect(Child.findByIdAndDelete).toHaveBeenCalledWith('child123');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "Child deleted successfully"
            });
        });

        test('should return 404 if child not found', async () => {
            mockReq.params.id = 'nonExistentId';
            
            Child.findByIdAndDelete.mockResolvedValue(null);

            await childController.deleteChild(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: "Child not found"
            });
        });
    });
});