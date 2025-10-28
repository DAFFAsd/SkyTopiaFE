const User = require('../models/user.model');

// Role checking middleware
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.userId);
            
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // Check if user role is allowed
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
                });
            }

            req.currentUser = user;
            next();
            
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    };
};

// Single role middleware
const requireAdmin = requireRole(['Admin']);
const requireTeacher = requireRole(['Teacher']);
const requireParent = requireRole(['Parent']);

// Multi role middleware
const requireAdminOrTeacher = requireRole(['Admin', 'Teacher']);
const requireAdminOrParent = requireRole(['Admin', 'Parent']);
const requireTeacherOrParent = requireRole(['Teacher', 'Parent']);
const requireAnyRole = requireRole(['Admin', 'Teacher', 'Parent']);

module.exports = {
    requireRole,
    requireAdmin,
    requireTeacher, 
    requireParent,
    requireAdminOrTeacher,
    requireAdminOrParent,
    requireTeacherOrParent,
    requireAnyRole
};