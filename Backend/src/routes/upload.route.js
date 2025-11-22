const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/auth');
const { requireAnyRole } = require('../middleware/roleCheck');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload single image
router.post('/', authMiddleware, requireAnyRole, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        // Convert buffer to base64 data URI
        const dataURI = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: 'skytopia-uploads',
            public_id: `upload_${Date.now()}`,
            resource_type: 'image'
        });

        res.json({
            success: true,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

module.exports = router;