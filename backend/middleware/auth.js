const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Authentication Middleware
const verifyJWT = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'No authentication token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('JWT verification error:', error);
        return res.status(401).json({ 
            success: false, 
            error: 'Invalid or expired token' 
        });
    }
};

// Socket.IO JWT Authentication
const verifySocketJWT = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ firebaseUid: decoded.firebaseUid }).select('-password');
        
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.firebaseUid = user.firebaseUid;
        socket.user = user;
        next();
    } catch (error) {
        console.error('Socket JWT verification error:', error);
        next(new Error('Authentication error: Invalid token'));
    }
};

// Firebase Token Verification (for initial login and token exchange)
const verifyFirebaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'No authentication token provided' 
            });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.firebaseUser = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified
        };
        
        next();
    } catch (error) {
        console.error('Firebase token verification error:', error);
        return res.status(401).json({ 
            success: false, 
            error: 'Invalid or expired Firebase token' 
        });
    }
};

module.exports = { 
    verifyJWT, 
    verifySocketJWT, 
    verifyFirebaseToken 
};
