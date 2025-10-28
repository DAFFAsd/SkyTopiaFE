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

        // Check if email or phone already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "User with this email or phone already exists" 
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: "Password must be at least 8 characters long" 
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
            token = generateToken({ 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            });
        } catch (tokenError) {
            console.error('Token generation error:', tokenError);
            return res.status(500).json({ 
                success: false, 
                message: "Token generation failed",
                error: "Check JWT environment variables"
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
        res.status(500).json({ 
            success: false, 
            message: "Server error",
            error: err.message 
        });
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

        // Return success response (without password)
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

        // Return token and user data (without password)
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
        const users = await User.find().select('-password');
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

// Update user - Admin only (name / password / phone)
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

        // Update user and return updated data (without password)
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