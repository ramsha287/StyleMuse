const fs = require('fs');
const path = require('path');

// Project structure definition
const projectStructure = {
    'src': {
        'config': {
            'db.js': '// MongoDB connection setup',
            'cloudinary.js': '// Cloudinary config for image uploads',
            'payment.js': '// Payment gateway (Stripe, PayPal) config',
            'dotenv.js': '// Load environment variables'
        },
        'models': {
            'User.js': '// User model schema',
            'Product.js': '// Product model schema',
            'Category.js': '// Category model schema',
            'Brand.js': '// Brand model schema',
            'Coupon.js': '// Coupon model schema',
            'Payment.js': '// Payment model schema',
            'Review.js': '// Review model schema',
            'Order.js': '// Order model schema',
            'Cart.js': '// Cart model schema',
            'Wishlist.js': '// Wishlist model schema',
            'ShippingMethod.js': '// Shipping method model schema'
        },
        'controllers': {
            'authController.js': '// Authentication controller',
            'userController.js': '// User controller',
            'productController.js': '// Product controller',
            'categoryController.js': '// Category controller',
            'brandController.js': '// Brand controller',
            'couponController.js': '// Coupon controller',
            'paymentController.js': '// Payment controller',
            'reviewController.js': '// Review controller',
            'orderController.js': '// Order controller',
            'cartController.js': '// Cart controller',
            'wishlistController.js': '// Wishlist controller',
            'shippingController.js': '// Shipping controller'
        },
        'routes': {
            'authRoutes.js': '// Authentication routes',
            'userRoutes.js': '// User routes',
            'productRoutes.js': '// Product routes',
            'categoryRoutes.js': '// Category routes',
            'brandRoutes.js': '// Brand routes',
            'couponRoutes.js': '// Coupon routes',
            'paymentRoutes.js': '// Payment routes',
            'reviewRoutes.js': '// Review routes',
            'orderRoutes.js': '// Order routes',
            'cartRoutes.js': '// Cart routes',
            'wishlistRoutes.js': '// Wishlist routes',
            'shippingRoutes.js': '// Shipping routes'
        },
        'middlewares': {
            'authMiddleware.js': '// Authentication middleware',
            'errorMiddleware.js': '// Error handling middleware',
            'uploadMiddleware.js': '// File upload middleware'
        },
        'utils': {
            'sendEmail.js': '// Email sending utility',
            'generateToken.js': '// JWT token generator',
            'logger.js': '// Logging utility'
        },
        'views': {},
        'server.js': '// Main application entry point',
        'app.js': '// Express app setup'
    },
    '.env': 'PORT=3000\nMONGODB_URI=mongodb://localhost:27017/ecommerce\nJWT_SECRET=your_jwt_secret',
    '.gitignore': 'node_modules/\n.env\n.DS_Store',
    'package.json': JSON.stringify({
        "name": "ecommerce-api",
        "version": "1.0.0",
        "description": "E-commerce API with Express and Mongoose",
        "main": "src/server.js",
        "scripts": {
            "start": "node src/server.js",
            "dev": "nodemon src/server.js"
        },
        "dependencies": {
            "express": "^4.18.2",
            "mongoose": "^7.0.0",
            "dotenv": "^16.0.3",
            "bcryptjs": "^2.4.3",
            "jsonwebtoken": "^9.0.0",
            "cors": "^2.8.5",
            "express-validator": "^7.0.1",
            "multer": "^1.4.5-lts.1",
            "cloudinary": "^1.35.0",
            "stripe": "^12.0.0",
            "nodemailer": "^6.9.1"
        },
        "devDependencies": {
            "nodemon": "^2.0.22"
        }
    }, null, 2),
    'README.md': '# E-commerce API\n\nA RESTful API for an e-commerce platform built with Express.js and MongoDB.'
};

// Function to create directories and files
function createStructure(basePath, structure) {
    for (const [name, content] of Object.entries(structure)) {
        const fullPath = path.join(basePath, name);
        
        if (typeof content === 'object' && content !== null) {
            // Create directory
            fs.mkdirSync(fullPath, { recursive: true });
            // Recursively create contents
            createStructure(fullPath, content);
        } else {
            // Create file
            fs.writeFileSync(fullPath, content);
        }
    }
}

// Create the project structure
const projectName = 'ecommerce-api';
const projectPath = path.join(process.cwd(), projectName);

try {
    // Create main project directory
    fs.mkdirSync(projectPath);
    // Create the structure
    createStructure(projectPath, projectStructure);
    console.log('Project structure created successfully!');
} catch (error) {
    console.error('Error creating project structure:', error);
} 