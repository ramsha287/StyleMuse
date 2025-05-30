const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorMiddleware');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new AppError('Only image and video files are allowed!', 400), false);
    }
};

// Configure upload with better error handling
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size for videos
        files: 6 // max 5 images + 1 video
    }
}).fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
]);

// Wrap multer middleware to handle errors
const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new AppError('File too large. Maximum size is 50MB.', 400));
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return next(new AppError('Too many files. Maximum is 5 images and 1 video.', 400));
            }
            return next(new AppError(err.message, 400));
        } else if (err) {
            return next(new AppError(err.message, 400));
        }
        next();
    });
};

module.exports = uploadMiddleware; 