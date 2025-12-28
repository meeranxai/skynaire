const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/g-network';
        
        // Validate MongoDB URI format
        if (!MONGO_URI.includes('mongodb')) {
            throw new Error('Invalid MongoDB URI format');
        }
        
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        
        // Don't exit in production, let the app run without DB for now
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        } else {
            console.warn('⚠️ Running without database connection in production');
        }
    }
};

module.exports = connectDB;
