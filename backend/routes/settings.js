/**
 * User Settings Management API
 * Comprehensive settings CRUD operations with validation
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const speakeasy = require('speakeasy'); // For 2FA
const QRCode = require('qrcode'); // For 2FA QR codes
const crypto = require('crypto');

// ============================================
// SETTINGS RETRIEVAL
// ============================================

// @route   GET /api/settings/:userId
// @desc    Get all user settings
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Return settings (exclude sensitive data)
        const settings = {
            profile: {
                displayName: user.displayName,
                username: user.username,
                bio: user.bio,
                pronouns: user.pronouns,
                website: user.website,
                location: user.location,
                birthDate: user.birthDate,
                photoURL: user.photoURL,
                coverPhotoURL: user.coverPhotoURL,
                lastUsernameChange: user.lastUsernameChange,
                lastDisplayNameChange: user.lastDisplayNameChange
            },
            privacy: user.privacy,
            security: {
                twoFactorEnabled: user.security?.twoFactorEnabled || false,
                twoFactorMethod: user.security?.twoFactorMethod || 'none',
                passwordLastChanged: user.security?.passwordLastChanged,
                activeSessions: user.security?.activeSessions || [],
                securityAlerts: user.security?.securityAlerts !== false
            },
            notifications: user.notifications,
            contentPreferences: user.contentPreferences,
            dataControls: user.dataControls,
            creatorMode: user.creatorMode,
            accessibility: user.accessibility,
            accountStatus: user.accountStatus,
            chatPreferences: user.chatPreferences
        };

        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// PROFILE UPDATES
// ============================================

// @route   PATCH /api/settings/:userId/profile
// @desc    Update profile settings
router.patch('/:userId/profile', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { displayName, bio, pronouns, website, location, birthDate } = req.body;

        // Display Name validation
        if (displayName !== undefined) {
            if (displayName.length < 1 || displayName.length > 50) {
                return res.status(400).json({ message: 'Display name must be 1-50 characters' });
            }

            // Check cooldown (14 days)
            if (user.lastDisplayNameChange) {
                const daysSinceChange = (Date.now() - user.lastDisplayNameChange) / (1000 * 60 * 60 * 24);
                if (daysSinceChange < 14) {
                    return res.status(400).json({
                        message: `You can change your display name in ${Math.ceil(14 - daysSinceChange)} days`
                    });
                }
            }

            user.displayName = displayName;
            user.lastDisplayNameChange = new Date();
        }

        // Bio validation
        if (bio !== undefined) {
            if (bio.length > 300) {
                return res.status(400).json({ message: 'Bio must be max 300 characters' });
            }
            user.bio = bio;
        }

        // Pronouns
        if (pronouns !== undefined) {
            if (pronouns.length > 30) {
                return res.status(400).json({ message: 'Pronouns must be max 30 characters' });
            }
            user.pronouns = pronouns;
        }

        // Website
        if (website !== undefined) {
            // Basic URL validation
            if (website && !website.match(/^https?:\/\/.+/)) {
                return res.status(400).json({ message: 'Invalid website URL' });
            }
            user.website = website;
        }

        // Location
        if (location) {
            user.location = {
                name: location.name || '',
                lat: location.lat,
                lng: location.lng,
                privacy: location.privacy || 'everyone'
            };
        }

        // Birth Date
        if (birthDate) {
            user.birthDate = {
                date: birthDate.date,
                privacy: birthDate.privacy || 'hidden'
            };
        }

        user.lastSettingChange = new Date();
        await user.save();

        res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PATCH /api/settings/:userId/username
// @desc    Update username (with cooldown and uniqueness check)
router.patch('/:userId/username', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { username } = req.body;

        // Validation
        if (!username || username.length < 3 || username.length > 30) {
            return res.status(400).json({ message: 'Username must be 3-30 characters' });
        }

        if (!username.match(/^[a-z0-9_]+$/)) {
            return res.status(400).json({ message: 'Username can only contain lowercase letters, numbers, and underscores' });
        }

        // Check cooldown (30 days)
        if (user.lastUsernameChange) {
            const daysSinceChange = (Date.now() - user.lastUsernameChange) / (1000 * 60 * 60 * 24);
            if (daysSinceChange < 30) {
                return res.status(400).json({
                    message: `You can change your username in ${Math.ceil(30 - daysSinceChange)} days`
                });
            }
        }

        // Check uniqueness
        const existing = await User.findOne({ username: username.toLowerCase() });
        if (existing && existing.firebaseUid !== req.params.userId) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Reserved words check
        const reserved = ['admin', 'support', 'official', 'gnetwork', 'system', 'help'];
        if (reserved.includes(username.toLowerCase())) {
            return res.status(400).json({ message: 'This username is reserved' });
        }

        // Save old username to history
        user.usernameHistory.push({
            username: user.username,
            changedAt: new Date()
        });

        // Keep only last 5
        if (user.usernameHistory.length > 5) {
            user.usernameHistory = user.usernameHistory.slice(-5);
        }

        user.username = username.toLowerCase();
        user.lastUsernameChange = new Date();
        user.lastSettingChange = new Date();

        await user.save();

        res.json({ success: true, message: 'Username updated successfully', username: user.username });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// PRIVACY SETTINGS
// ============================================

// @route   PATCH /api/settings/:userId/privacy
// @desc    Update privacy settings
router.patch('/:userId/privacy', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const privacyUpdates = req.body;

        // Merge with existing settings
        user.privacy = {
            ...user.privacy,
            ...privacyUpdates
        };

        user.lastSettingChange = new Date();
        await user.save();

        res.json({ success: true, message: 'Privacy settings updated', privacy: user.privacy });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// SECURITY & 2FA
// ============================================

// @route   POST /api/settings/:userId/security/2fa/setup
// @desc    Initialize 2FA setup
router.post('/:userId/security/2fa/setup', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `G-Network (${user.username})`,
            length: 32
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        // Store secret temporarily (not enabled yet)
        user.security = user.security || {};
        user.security.twoFactorSecret = secret.base32; // Should be encrypted in production
        await user.save();

        res.json({
            success: true,
            secret: secret.base32,
            qrCode: qrCodeUrl,
            message: 'Scan the QR code with your authenticator app'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/settings/:userId/security/2fa/verify
// @desc    Verify and enable 2FA
router.post('/:userId/security/2fa/verify', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { token } = req.body;

        if (!user.security?.twoFactorSecret) {
            return res.status(400).json({ message: 'Please setup 2FA first' });
        }

        // Verify token
        const verified = speakeasy.totp.verify({
            secret: user.security.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid authentication code' });
        }

        // Generate backup codes
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }

        user.security.twoFactorEnabled = true;
        user.security.twoFactorMethod = 'totp';
        user.security.backupCodes = backupCodes; // Should be hashed in production
        user.lastSettingChange = new Date();

        await user.save();

        res.json({
            success: true,
            message: '2FA enabled successfully',
            backupCodes: backupCodes
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/settings/:userId/security/2fa/disable
// @desc    Disable 2FA
router.post('/:userId/security/2fa/disable', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { password, token } = req.body;

        // Verify password and/or current 2FA token for security
        // This is a simplified version - add proper password verification

        user.security.twoFactorEnabled = false;
        user.security.twoFactorMethod = 'none';
        user.security.twoFactorSecret = null;
        user.security.backupCodes = [];
        user.lastSettingChange = new Date();

        await user.save();

        res.json({ success: true, message: '2FA disabled successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/settings/:userId/security/sessions
// @desc    Get active sessions
router.get('/:userId/security/sessions', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const sessions = user.security?.activeSessions || [];

        res.json({ success: true, sessions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/settings/:userId/security/sessions/:sessionId
// @desc    Logout specific session
router.delete('/:userId/security/sessions/:sessionId', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.security.activeSessions = user.security.activeSessions.filter(
            s => s.sessionId !== req.params.sessionId
        );

        await user.save();

        res.json({ success: true, message: 'Session logged out' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// NOTIFICATIONS
// ============================================

// @route   PATCH /api/settings/:userId/notifications
// @desc    Update notification settings
router.patch('/:userId/notifications', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { push, email, doNotDisturb, intelligentDelivery } = req.body;

        user.notifications = {
            push: { ...user.notifications.push, ...push },
            email: { ...user.notifications.email, ...email },
            doNotDisturb: doNotDisturb || user.notifications.doNotDisturb,
            intelligentDelivery: intelligentDelivery !== undefined ? intelligentDelivery : user.notifications.intelligentDelivery
        };

        user.lastSettingChange = new Date();
        await user.save();

        res.json({ success: true, message: 'Notification settings updated', notifications: user.notifications });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// CONTENT PREFERENCES
// ============================================

// @route   PATCH /api/settings/:userId/content
// @desc    Update content preferences
router.patch('/:userId/content', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updates = req.body;

        user.contentPreferences = {
            ...user.contentPreferences,
            ...updates
        };

        user.lastSettingChange = new Date();
        await user.save();

        res.json({ success: true, message: 'Content preferences updated', contentPreferences: user.contentPreferences });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// SAFETY & BLOCKING
// ============================================

// @route   POST /api/settings/:userId/safety/block
// @desc    Block a user
router.post('/:userId/safety/block', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { targetUserId } = req.body;

        if (!user.blockedUsers.includes(targetUserId)) {
            user.blockedUsers.push(targetUserId);

            // Remove from followers/following
            user.followers = user.followers.filter(f => f !== targetUserId);
            user.following = user.following.filter(f => f !== targetUserId);

            // Also remove from target's lists
            const targetUser = await User.findOne({ firebaseUid: targetUserId });
            if (targetUser) {
                targetUser.followers = targetUser.followers.filter(f => f !== req.params.userId);
                targetUser.following = targetUser.following.filter(f => f !== req.params.userId);
                await targetUser.save();
            }

            await user.save();
        }

        res.json({ success: true, message: 'User blocked' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/settings/:userId/safety/unblock
// @desc    Unblock a user
router.post('/:userId/safety/unblock', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { targetUserId } = req.body;

        user.blockedUsers = user.blockedUsers.filter(id => id !== targetUserId);
        await user.save();

        res.json({ success: true, message: 'User unblocked' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/settings/:userId/safety/mute
// @desc    Mute a user
router.post('/:userId/safety/mute', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { targetUserId, duration } = req.body;

        // Remove if already muted
        user.mutedUsers = user.mutedUsers.filter(m => m.userId !== targetUserId);

        // Add mute
        user.mutedUsers.push({
            userId: targetUserId,
            mutedAt: new Date(),
            muteUntil: duration ? new Date(Date.now() + duration) : null
        });

        await user.save();

        res.json({ success: true, message: 'User muted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================
// DATA EXPORT & ACCOUNT
// ============================================

// @route   POST /api/settings/:userId/data/export
// @desc    Request data export
router.post('/:userId/data/export', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // In production, this would:
        // 1. Queue a background job
        // 2. Generate ZIP of all user data
        // 3. Send download link via email
        // 4. Auto-delete after 7 days

        res.json({
            success: true,
            message: 'Data export requested. You will receive an email with download link within 24 hours.',
            estimatedTime: '24 hours'
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/settings/:userId/account/deactivate
// @desc    Deactivate account
router.post('/:userId/account/deactivate', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { reason } = req.body;

        user.accountStatus.isActive = false;
        user.accountStatus.isDeactivated = true;
        user.accountStatus.deactivatedAt = new Date();
        user.accountStatus.deactivationReason = reason || 'Not specified';

        await user.save();

        res.json({ success: true, message: 'Account deactivated. You can reactivate anytime by logging in.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/settings/:userId/account/delete
// @desc    Schedule account deletion
router.post('/:userId/account/delete', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 30-day grace period
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 30);

        user.accountStatus.isDeletionScheduled = true;
        user.accountStatus.deletionScheduledFor = deletionDate;
        user.accountStatus.isActive = false;

        await user.save();

        res.json({
            success: true,
            message: `Account deletion scheduled for ${deletionDate.toLocaleDateString()}. You can cancel by logging in before this date.`,
            deletionDate
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PATCH /api/settings/:userId/accessibility
// @desc    Update accessibility settings
router.patch('/:userId/accessibility', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.accessibility = {
            ...user.accessibility,
            ...req.body
        };

        user.lastSettingChange = new Date();
        await user.save();

        res.json({ success: true, message: 'Accessibility settings updated', accessibility: user.accessibility });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PATCH /api/settings/:userId/creator
// @desc    Update creator mode settings
router.patch('/:userId/creator', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.creatorMode = {
            ...user.creatorMode,
            ...req.body
        };

        user.lastSettingChange = new Date();
        await user.save();

        res.json({ success: true, message: 'Creator settings updated', creatorMode: user.creatorMode });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// @route   PATCH /api/settings/:userId/chat
// @desc    Update chat preferences
router.patch('/:userId/chat', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.chatPreferences = {
            ...user.chatPreferences,
            ...req.body
        };

        user.lastSettingChange = new Date();
        await user.save();

        res.json({ success: true, message: 'Chat settings updated', chatPreferences: user.chatPreferences });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
