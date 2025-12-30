const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyFirebaseToken, verifyJWT } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateJWTToken = (firebaseUid, userId) => {
    return jwt.sign({ 
        firebaseUid, 
        userId 
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// @route   POST /api/auth/firebase-login
// @desc    Exchange Firebase ID Token for JWT backend token
// @access  Public (but requires valid Firebase token)
router.post('/firebase-login', verifyFirebaseToken, async (req, res) => {
    try {
        const { firebaseUid, email, displayName, photoURL } = req.body;
        const firebaseUser = req.firebaseUser;

        // Find or create user in our database
        let user = await User.findOne({ firebaseUid: firebaseUser.uid });

        if (!user) {
            // Create new user from Firebase data
            user = new User({
                firebaseUid: firebaseUser.uid,
                email: firebaseUser.email || email,
                displayName: displayName || firebaseUser.email?.split('@')[0] || 'User',
                username: (displayName || firebaseUser.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now(),
                profile: {
                    photoURL: photoURL || ''
                },
                isOnline: true,
                lastSeen: new Date()
            });
            await user.save();
            console.log(`Created new user: ${user.displayName} (${user.firebaseUid})`);
        } else {
            // Update existing user
            user.isOnline = true;
            user.lastSeen = new Date();
            if (displayName) user.displayName = displayName;
            if (photoURL) user.profile.photoURL = photoURL;
            await user.save();
            console.log(`Updated existing user: ${user.displayName} (${user.firebaseUid})`);
        }

        // Generate JWT token for backend authorization
        const jwtToken = generateJWTToken(user.firebaseUid, user._id);

        res.json({
            success: true,
            message: 'Firebase login successful',
            jwtToken,
            user: {
                id: user._id,
                firebaseUid: user.firebaseUid,
                email: user.email,
                displayName: user.displayName,
                username: user.username,
                photoURL: user.profile?.photoURL || user.photoURL,
                isOnline: user.isOnline
            }
        });

    } catch (error) {
        console.error('Firebase login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during Firebase login'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (mark offline)
// @access  Private (JWT)
router.post('/logout', verifyJWT, async (req, res) => {
    try {
        // Update user offline status
        const user = await User.findById(req.user._id);
        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            user.socketIds = []; // Clear socket connections
            await user.save();
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during logout'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private (JWT)
router.get('/me', verifyJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('followers', 'displayName username photoURL')
            .populate('following', 'displayName username photoURL');

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private (JWT)
router.put('/profile', verifyJWT, [
    body('displayName').optional().trim().isLength({ min: 2, max: 50 }),
    body('bio').optional().trim().isLength({ max: 160 }),
    body('photoURL').optional().isURL()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { displayName, bio, photoURL } = req.body;
        const updateFields = {};

        if (displayName) updateFields.displayName = displayName;
        if (bio !== undefined) updateFields['profile.bio'] = bio;
        if (photoURL) updateFields['profile.photoURL'] = photoURL;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during profile update'
        });
    }
});

// @route   GET /api/auth/online-users
// @desc    Get online users
// @access  Private (JWT)
router.get('/online-users', verifyJWT, async (req, res) => {
    try {
        const onlineUsers = await User.find({ 
            isOnline: true,
            _id: { $ne: req.user._id } // Exclude current user
        })
        .select('firebaseUid displayName username profile.photoURL lastSeen')
        .limit(50);

        res.json({
            success: true,
            users: onlineUsers.map(user => ({
                uid: user.firebaseUid,
                displayName: user.displayName,
                username: user.username,
                photoURL: user.profile?.photoURL || '',
                lastSeen: user.lastSeen
            }))
        });

    } catch (error) {
        console.error('Get online users error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

module.exports = router;