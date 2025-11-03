const cloudinary = require("cloudinary").v2;
const multer = require('multer');
require("dotenv").config();

// Configure cloudinary
cloudinary.config(process.env.CLOUDINARY_URL);

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Create multer instance
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    },
    fileFilter: (req, file, cb) => {
        // Validate file type - only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

module.exports = { 
    cloudinary, 
    upload 
};