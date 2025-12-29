const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const helmet = require('helmet');
const morgan = require('morgan');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

console.log('🚀 Starting Robust Server...');

// ================================
// GRACEFUL ERROR HANDLING
// ================================
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err.message);
    console.error('Stack:', err.stack);
    // Don't exit, try to continue
});

process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err.message);
    // Don't exit, try to continue
});

// ================================
// CORS CONFIGURATION (ROBUST)
// ================================
const allowedOrigins = [
    'https://mygwnetwork.vercel.app',
    'https://mygwnetwork-227iteo97-my-world-741435e1.vercel.app',
    'https://skynaire.vercel.app',
    'https://skynaire-git-main-my-world-741435e1.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Log the blocked origin for debugging
        console.log('🚫 CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
};

// Apply CORS
app.use(cors(corsOptions));

// Security headers (with error handling)
try {
    app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
} catch (err) {
    console.warn('⚠️ Helmet setup failed:', err.message);
}

// Request logging (with error handling)
try {
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }
} catch (err) {
    console.warn('⚠️ Morgan setup failed:', err.message);
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ================================
// DATABASE CONNECTION (GRACEFUL)
// ================================
let dbConnected = false;

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn('⚠️ MONGO_URI not set - running without database');
            return;
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected Successfully');
        dbConnected = true;
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.warn('⚠️ Running without database connection');
        dbConnected = false;
    }
};

connectDB();

// ================================
// FIREBASE ADMIN (GRACEFUL)
// ================================
let firebaseInitialized = false;

try {
    const admin = require('firebase-admin');
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin Initialized');
        firebaseInitialized = true;
    } else {
        console.warn('⚠️ Firebase Admin NOT initialized: FIREBASE_SERVICE_ACCOUNT not set');
    }
} catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error.message);
    console.warn('⚠️ Running without Firebase Admin');
    firebaseInitialized = false;
}

// ================================
// SOCKET.IO SETUP
// ================================
const io = new Server(server, {
    cors: corsOptions,
    pingTimeout: 60000,
    pingInterval: 25000
});

app.set('socketio', io);

// ================================
// HEALTH CHECK
// ================================
app.get('/health', (req, res) => {
    try {
        const healthStatus = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            services: {
                mongodb: dbConnected ? 'Connected' : 'Disconnected',
                firebase: firebaseInitialized ? 'Initialized' : 'Not Initialized',
                socketio: 'Enabled'
            },
            cors: {
                configured: true,
                allowedOrigins: allowedOrigins
            }
        };
        
        res.status(200).json(healthStatus);
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Test endpoint
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Robust backend is working!',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'No origin header',
        cors: 'Enabled'
    });
});

// ================================
// DYNAMIC ROUTE LOADING
// ================================
const loadRoutes = () => {
    try {
        // Only load routes if database is connected
        if (dbConnected) {
            console.log('📁 Loading API routes...');
            
            // Load routes with error handling
            const routes = [
                { path: '/api/posts', file: './routes/posts' },
                { path: '/api/users', file: './routes/users' },
                { path: '/api/chat', file: './routes/chat' },
                { path: '/api/notifications', file: './routes/notifications' },
                { path: '/api/stories', file: './routes/stories' },
                { path: '/api/collections', file: './routes/collections' },
                { path: '/api/ai', file: './routes/ai' },
                { path: '/api/settings', file: './routes/settings' },
                { path: '/api/autonomous', file: './routes/autonomous' },
                { path: '/api/reports', file: './routes/reports' },
                { path: '/api/reels', file: './routes/reels' }
            ];
            
            routes.forEach(route => {
                try {
                    const routeHandler = require(route.file);
                    app.use(route.path, routeHandler);
                    console.log(`✅ Loaded route: ${route.path}`);
                } catch (err) {
                    console.error(`❌ Failed to load route ${route.path}:`, err.message);
                    
                    // Create fallback route
                    app.use(route.path, (req, res) => {
                        res.status(503).json({
                            error: 'Service temporarily unavailable',
                            route: route.path,
                            message: 'Route failed to load'
                        });
                    });
                }
            });
        } else {
            console.log('⚠️ Database not connected - providing mock API responses');
            
            // Mock API responses when database is not available
            app.get('/api/posts', (req, res) => {
                res.json({ posts: [], totalPosts: 0, hasMore: false, mode: 'no-database' });
            });
            
            app.get('/api/stories', (req, res) => {
                res.json([]);
            });
            
            app.get('/api/notifications/:userId', (req, res) => {
                res.json([]);
            });
            
            app.get('/api/chat/unread-counts/:userId', (req, res) => {
                res.json([]);
            });
            
            app.get('/api/autonomous/theme/user/:userId', (req, res) => {
                res.json({
                    theme: { primaryColor: '#1976d2', secondaryColor: '#dc004e', mode: 'light' },
                    mode: 'no-database'
                });
            });
            
            app.post('/api/users/sync', (req, res) => {
                res.json({ success: true, user: req.body, mode: 'no-database' });
            });
            
            app.all('/api/*', (req, res) => {
                res.json({
                    message: 'Database not connected - limited functionality',
                    mode: 'no-database'
                });
            });
        }
    } catch (err) {
        console.error('❌ Route loading failed:', err.message);
    }
};

// Load routes after a short delay to ensure database connection attempt
setTimeout(loadRoutes, 2000);

// ================================
// SOCKET.IO LOGIC (ROBUST)
// ================================
io.on('connection', (socket) => {
    console.log('🔌 User Connected:', socket.id);

    try {
        // Basic socket events with error handling
        socket.on('user_online', async (userData) => {
            try {
                if (!dbConnected) {
                    socket.emit('error', { message: 'Database not connected' });
                    return;
                }
                
                // Handle user online logic here
                console.log('👤 User online:', userData?.firebaseUid);
            } catch (err) {
                console.error('Socket user_online error:', err.message);
            }
        });

        socket.on('join_personal_room', (uid) => {
            try {
                socket.join(uid);
                console.log(`👤 User ${uid} joined personal room`);
            } catch (err) {
                console.error('Socket join_personal_room error:', err.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('🔌 User Disconnected:', socket.id);
        });
        
    } catch (err) {
        console.error('Socket connection error:', err.message);
    }
});

// ================================
// ERROR HANDLERS
// ================================
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});

app.use((err, req, res, next) => {
    console.error('💥 Express Error:', err.message);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Robust Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Socket.io enabled`);
    console.log(`💪 Robust mode: Handles missing dependencies gracefully`);
});

module.exports = { app, server, io };