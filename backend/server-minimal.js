const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================================
// CORS Configuration - Very Permissive for Testing
// ================================
const corsOptions = {
    origin: [
        'https://skynaire.vercel.app',
        'https://skynaire-git-main-my-world-741435e1.vercel.app', 
        'https://skynaire-evqp804fk-my-world-741435e1.vercel.app',
        'https://mygwnetwork.vercel.app',
        'https://mygwnetwork-227iteo97-my-world-741435e1.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// BASIC ROUTES
// ================================

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Backend is running!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'CORS Test Successful!',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    });
});

// Basic API endpoints for testing
app.get('/api/users/sync', (req, res) => {
    res.status(200).json({
        message: 'User sync endpoint working',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/users/sync', (req, res) => {
    console.log('User sync request:', req.body);
    res.status(200).json({
        message: 'User synced successfully',
        user: req.body,
        timestamp: new Date().toISOString()
    });
});

// Catch all route
app.get('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// ================================
// START SERVER
// ================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Minimal Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for multiple domains`);
});

module.exports = app;