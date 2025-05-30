const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        console.log('📝 Database URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Hide credentials
        
        // Start server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📝 API Documentation available at http://localhost:${PORT}/api-docs`);
        });

        // Handle server errors
        server.on('error', (error) => {
            console.error('❌ Server error:', error);
            process.exit(1);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        console.error('❌ Please check your MongoDB connection string and make sure MongoDB is running');
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    // Close server & exit process
    process.exit(1);
}); 

