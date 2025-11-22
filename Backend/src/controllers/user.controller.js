const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middleware/auth');

// First time setup register (for testing)
exports.setupAdmin = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        // Check if any user already exists in database
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return res.status(403).json({
                success: false,
                message: "Setup already completed",
                error: "First admin already exists. Please use regular register endpoint with admin token."
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false, message: "Password must be at least 8 characters long"
            });
        }

        // Hash password before saving to database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create first admin user in database
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'Admin',
            phone
        });

        // Generate token for immediate login
        let token;
        try {
            token = generateToken({ userId: user._id, email: user.email, role: user.role });
        } catch (tokenError) {
            console.error('Token generation error:', tokenError);
            return res.status(500).json({
                success: false, message: "Token generation failed", error: "Check JWT environment variables"
            });
        }

        // Return success response with token
        res.status(201).json({
            success: true,
            message: "First admin user created successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                createdAt: user.createdAt
            }
        });

    } catch (err) {
        console.error('Setup Admin Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Register new user - Admin only
exports.register = async (req, res) => {
    const { name, email, password, role, phone } = req.body;

    try {
        // Check if email or phone already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Hash password before saving to database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user in database
        const user = await User.create({ name, email, password: hashedPassword, role, phone });

        // Return success response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Login user - Public access
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Compare password with hashed password in database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate JWT token with user data
        const token = generateToken({ userId: user._id, email: user.email, role: user.role });

        // Return token and user data
        res.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get all users - Admin only
exports.getAllUsers = async (req, res) => {
    try {
        // Find all users and exclude password field from response
        const { role } = req.query;
        
        let query = {};
        if (role) {
            query.role = role;
        }
        
        const users = await User.find(query).select('-password');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get user by ID - Admin only
exports.getUserById = async (req, res) => {
    try {
        // Find user by ID and exclude password field from response
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get current user profile - all authenticated users
exports.getProfile = async (req, res) => {
    try {
        // Get user data from token (req.user.userId) and exclude password
        const user = await User.findById(req.user.userId).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update user - Admin only
exports.updateUser = async (req, res) => {
    try {
        const { name, password, phone } = req.body;
        const updateData = { name, phone };

        // If password is provided, hash it before updating
        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user and return updated data
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete user - Admin only
exports.deleteUser = async (req, res) => {
    try {
        // Find and delete user by ID
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get dashboard statistics - Admin only
exports.getDashboardStats = async (req, res) => {
    try {
        const User = require('../models/user.model');
        const Child = require('../models/child.model');
        const DailyReport = require('../models/dailyReport.model');
        const SemesterReport = require('../models/semesterReport.model');
        const Payment = require('../models/payment.model');

        // Calculate date ranges
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(today);
        // calculate Sunday by subtracting current day index from current date
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Get current semester for filtering
        const getCurrentSemester = () => {
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            return month <= 6 ? `${year}-1` : `${year}-2`;
        };

        // 1. User statistics
        const totalChildren = await Child.countDocuments();
        const totalParents = await User.countDocuments({ role: 'Parent' });
        const totalTeachers = await User.countDocuments({ role: 'Teacher' });
        const totalAdmins = await User.countDocuments({ role: 'Admin' });

        // 2. Daily report activity
        const todaysDailyReports = await DailyReport.countDocuments({
            date: { $gte: today }
        });
        const thisWeekDailyReports = await DailyReport.countDocuments({
            date: { $gte: startOfWeek }
        });
        const thisMonthDailyReports = await DailyReport.countDocuments({
            date: { $gte: startOfMonth }
        });

        // 3. Semester reports overview
        const totalSemesterReports = await SemesterReport.countDocuments();
        const currentSemesterReports = await SemesterReport.countDocuments({
            semester: getCurrentSemester()
        });

        const lastSemesterReports = await SemesterReport.countDocuments({
            semester: getCurrentSemester() === `${today.getFullYear()}-1`
                ? `${today.getFullYear() - 1}-2` : `${today.getFullYear()}-1`
        });

        // 4. Financial overview
        const pendingPayments = await Payment.countDocuments({ status: 'Tertunda' });
        const sentPayments = await Payment.countDocuments({ status: 'Terkirim' });
        const paidPayments = await Payment.countDocuments({ status: 'Dibayar' });
        const overduePayments = await Payment.countDocuments({ status: 'Jatuh Tempo' });
        const rejectedPayments = await Payment.countDocuments({ status: 'Ditolak' });

        // 5. Revenue calculation
        const revenueResult = await Payment.aggregate([
            { $match: { status: 'Dibayar' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // 6. Recent activities
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const newChildrenThisMonth = await Child.countDocuments({
            createdAt: { $gte: startOfMonth }
        });
        const newChildrenLast30Days = await Child.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            stats: {
                // User Overview
                users: {
                    totalChildren,
                    totalParents,
                    totalTeachers,
                    totalAdmins
                },

                // Reports Activity
                reports: {
                    daily: {
                        today: todaysDailyReports,
                        thisWeek: thisWeekDailyReports,
                        thisMonth: thisMonthDailyReports
                    },
                    semester: {
                        total: totalSemesterReports,
                        currentSemester: currentSemesterReports,
                        lastSemester: lastSemesterReports
                    }
                },

                // Financial Status
                financial: {
                    pending: pendingPayments,
                    sent: sentPayments,
                    paid: paidPayments,
                    overdue: overduePayments,
                    rejected: rejectedPayments,
                    totalRevenue
                },

                // Recent Activity
                activity: {
                    newChildrenThisMonth,
                    newChildrenLast30Days
                }
            }
        });

    } catch (err) {
        console.error('Dashboard Stats Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Logout - Protected route
exports.logout = async (req, res) => {
    try {
        // Untuk JWT stateless, logout cukup di frontend (hapus token)
        // Jika ada refresh token atau blacklist, implementasikan di sini
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};