const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Profile Picture & Cover Photo Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = './uploads/avatars/';
        if (file.fieldname === 'coverPhoto') dest = './uploads/covers/';

        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const prefix = file.fieldname === 'coverPhoto' ? 'cover-' : 'avatar-';
        cb(null, prefix + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Error: Images Only!'));
    }
}).fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
]);

// Helper to filter user data based on privacy settings
const filterUserByPrivacy = (user, requesterId) => {
    if (!user) return null;
    const isOwner = requesterId === user.firebaseUid;
    
    // Base filtered object
    const filtered = {
        firebaseUid: user.firebaseUid,
        displayName: user.displayName,
        username: user.username,
        email: isOwner ? user.email : undefined, // Only owner sees email
        isOnline: user.isOnline,
        photoURL: user.profile?.photoURL || user.photoURL, // Fallback to legacy top-level if exists
        coverPhotoURL: user.profile?.coverPhotoURL || user.coverPhotoURL,
        pronouns: user.profile?.pronouns || user.pronouns,
        bio: user.profile?.bio || user.bio,
        website: user.profile?.website || user.website,
        location: user.profile?.location || user.location,
        verification: user.verification,
        techStack: user.techStack,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        privacy: user.privacy || {},
        accountStatus: user.accountStatus,
        createdAt: user.createdAt
    };

    if (isOwner) return filtered;

    const isFollowing = user.followers?.includes(requesterId);

    // Filter About/Bio based on privacy
    if (user.privacy?.profileVisibility === 'private' && !isFollowing && !isOwner) {
        filtered.bio = 'Private Content';
        filtered.website = undefined;
        filtered.location = undefined;
    }

    // Filter Profile Photo based on privacy
    if (user.privacy?.profileVisibility === 'private' && !isFollowing && !isOwner) {
        filtered.photoURL = '/images/default-avatar.png';
    }

    return filtered;
};

// @route   POST /api/users/sync
router.post('/sync', async (req, res) => {
    try {
        const { firebaseUid, email, displayName, photoURL } = req.body;
        console.log(`[Sync] Syncing user: ${email} (${firebaseUid})`);
        
        let user = await User.findOne({ firebaseUid });

        if (!user) {
            console.log(`[Sync] Creating new user for: ${email}`);
            // Generate a default username if new user
            const baseUsername = (displayName || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const username = `${baseUsername}${randomSuffix}`;

            user = new User({
                firebaseUid,
                email,
                displayName: displayName || 'G-User',
                username,
                profile: {
                    photoURL: photoURL || '/images/default-avatar.png',
                    bio: 'Hey there! I am using G-Network.'
                },
                privacy: {
                    isPrivate: false,
                    profileVisibility: 'public',
                    showActivityStatus: true
                },
                accountStatus: {
                    isActive: true,
                    accountType: 'personal'
                },
                verification: { isVerified: false }
            });
            
            try {
                await user.save();
                console.log(`[Sync] Successfully created user: ${username}`);
            } catch (saveErr) {
                console.error("[Sync] Error saving new user:", saveErr);
                throw saveErr;
            }
        } else {
            // Update existing user's last seen
            if (!user.displayName || user.displayName === 'New User') {
                user.displayName = displayName;
            }
            if (!user.profile?.photoURL && photoURL) {
                if (!user.profile) user.profile = {};
                user.profile.photoURL = photoURL;
            }
            user.lastSeen = new Date();
            await user.save();
        }

        const filteredUser = filterUserByPrivacy(user, firebaseUid);
        res.json({ success: true, user: filteredUser });
    } catch (err) {
        console.error("[Sync] Critical Sync Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/users/check-username/:username
router.get('/check-username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
        res.json({ available: !user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/users/list/contacts
router.get('/list/contacts', async (req, res) => {
    try {
        const { requesterId } = req.query;
        if (!requesterId) return res.status(400).json({ message: "Requester ID is required" });

        const user = await User.findOne({ firebaseUid: requesterId });
        if (!user) return res.status(404).json({ message: "User not found" });

        const following = await User.find({ firebaseUid: { $in: user.following } });
        const filteredFollowing = following.map(f => filterUserByPrivacy(f, requesterId));
        res.json(filteredFollowing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/users/list/online
router.get('/list/online', async (req, res) => {
    try {
        const { requesterId } = req.query;
        // Fetch users who are online
        const onlineUsers = await User.find({ isOnline: true });
        const filteredOnline = onlineUsers
            .filter(u => u.firebaseUid !== requesterId) // Exclude self
            .map(u => filterUserByPrivacy(u, requesterId));
        res.json(filteredOnline);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/users/batch
router.post('/batch', async (req, res) => {
    try {
        const { uids, requesterId } = req.body;
        if (!Array.isArray(uids)) return res.status(400).json({ message: "UIDs must be an array" });

        const users = await User.find({ firebaseUid: { $in: uids } });
        const userMap = {};
        users.forEach(u => {
            userMap[u.firebaseUid] = filterUserByPrivacy(u, requesterId);
        });
        res.json(userMap);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/users/:uid
router.get('/:uid', async (req, res) => {
    try {
        const { requesterId } = req.query;
        const user = await User.findOne({ firebaseUid: req.params.uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        const filteredUser = filterUserByPrivacy(user, requesterId);
        res.json(filteredUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/users/profile
router.put('/profile', (req, res, next) => {
    upload(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, async (req, res) => {
    try {
        const { userId, displayName, bio, privacy, pronouns, website, location, techStack } = req.body;
        if (!userId) return res.status(400).json({ message: "User ID is required" });

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (displayName) user.displayName = displayName;
        
        // Update profile nested object
        if (!user.profile) user.profile = {};
        if (bio !== undefined) user.profile.bio = bio;
        if (pronouns !== undefined) user.profile.pronouns = pronouns;
        if (website !== undefined) user.profile.website = website;

        if (techStack) {
            user.techStack = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? JSON.parse(techStack) : [techStack]);
        }

        if (location) {
            try {
                const locData = typeof location === 'string' ? JSON.parse(location) : location;
                user.profile.location = { ...user.profile.location, ...locData };
            } catch (e) { console.error("Location parse error", e); }
        }

        if (privacy) {
            try {
                const privacyData = typeof privacy === 'string' ? JSON.parse(privacy) : privacy;
                user.privacy = { ...user.privacy, ...privacyData };
            } catch (e) { console.error("Privacy parse error", e); }
        }

        // Handle Avatar
        if (req.files && req.files.avatar) {
            const file = req.files.avatar[0];
            // Delete old avatar if it exists
            const oldAvatar = user.profile?.photoURL || user.photoURL;
            if (oldAvatar && oldAvatar.startsWith('/uploads/avatars/')) {
                try {
                    const oldPath = path.join(__dirname, '..', oldAvatar);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                } catch (e) { console.error("Error deleting old avatar", e); }
            }
            user.profile.photoURL = `/uploads/avatars/${file.filename}`;
        }

        // Handle Cover Photo
        if (req.files && req.files.coverPhoto) {
            const file = req.files.coverPhoto[0];
            const oldCover = user.profile?.coverPhotoURL || user.coverPhotoURL;
            if (oldCover && oldCover.startsWith('/uploads/covers/')) {
                try {
                    const oldPath = path.join(__dirname, '..', oldCover);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                } catch (e) { console.error("Error deleting old cover", e); }
            }
            user.profile.coverPhotoURL = `/uploads/covers/${file.filename}`;
        }

        await user.save();
        
        // Return filtered user instead of raw document
        const filteredUser = filterUserByPrivacy(user, userId);
        res.json({ success: true, user: filteredUser });
    } catch (err) {
        console.error("Profile update 500:", err);
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/users/:uid/followers
router.get('/:uid/followers', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        const followers = await User.find({ firebaseUid: { $in: user.followers } });
        const filteredFollowers = followers.map(f => filterUserByPrivacy(f, null));
        res.json(filteredFollowers);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   GET /api/users/:uid/following
router.get('/:uid/following', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.params.uid });
        if (!user) return res.status(404).json({ message: "User not found" });

        const following = await User.find({ firebaseUid: { $in: user.following } });
        const filteredFollowing = following.map(f => filterUserByPrivacy(f, null));
        res.json(filteredFollowing);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   POST /api/users/follow
router.post('/follow', async (req, res) => {
    try {
        const { userId, targetUid } = req.body;
        if (userId === targetUid) return res.status(400).json({ message: "You cannot follow yourself" });

        const targetUser = await User.findOne({ firebaseUid: targetUid });
        const me = await User.findOne({ firebaseUid: userId });

        if (!targetUser || !me) return res.status(404).json({ message: "User not found" });

        if (targetUser.privacy.isPrivate) {
            if (!targetUser.followRequests.includes(userId)) {
                targetUser.followRequests.push(userId);
                await targetUser.save();
                // Create Notification
                const notif = new Notification({
                    recipient: targetUid,
                    sender: userId,
                    senderName: me.displayName,
                    senderAvatar: me.profile?.photoURL || me.photoURL,
                    type: 'follow_request'
                });
                await notif.save();
                const io = req.app.get('socketio');
                if (io) io.to(targetUid).emit('new_notification', notif);
            }
            return res.json({ success: true, status: 'requested' });
        } else {
            if (!targetUser.followers.includes(userId)) {
                targetUser.followers.push(userId);
                await targetUser.save();
                me.following.push(targetUid);
                await me.save();

                const notif = new Notification({
                    recipient: targetUid,
                    sender: userId,
                    senderName: me.displayName,
                    senderAvatar: me.profile?.photoURL || me.photoURL,
                    type: 'follow'
                });
                await notif.save();
                const io = req.app.get('socketio');
                if (io) io.to(targetUid).emit('new_notification', notif);
            }
            return res.json({ success: true, status: 'following' });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   POST /api/users/unfollow
router.post('/unfollow', async (req, res) => {
    try {
        const { userId, targetUid } = req.body;
        await User.findOneAndUpdate({ firebaseUid: targetUid }, { $pull: { followers: userId, followRequests: userId } });
        await User.findOneAndUpdate({ firebaseUid: userId }, { $pull: { following: targetUid } });
        res.json({ success: true, status: 'none' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   POST /api/users/follow-request/:action
router.post('/follow-request/:action', async (req, res) => {
    try {
        const { userId, targetUid } = req.body; // userId is the private owner, targetUid is the requester
        const { action } = req.params;

        const me = await User.findOne({ firebaseUid: userId });
        if (action === 'accept') {
            await User.findOneAndUpdate({ firebaseUid: userId }, { $pull: { followRequests: targetUid }, $addToSet: { followers: targetUid } });
            await User.findOneAndUpdate({ firebaseUid: targetUid }, { $addToSet: { following: userId } });

            const notif = new Notification({
                recipient: targetUid,
                sender: userId,
                senderName: me.displayName,
                type: 'follow_accept'
            });
            await notif.save();
            const io = req.app.get('socketio');
            if (io) io.to(targetUid).emit('new_notification', notif);
        } else {
            await User.findOneAndUpdate({ firebaseUid: userId }, { $pull: { followRequests: targetUid } });
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   GET /api/users/stats/:uid
router.get('/stats/:uid', async (req, res) => {
    try {
        const { requesterId } = req.query;
        const targetUser = await User.findOne({ firebaseUid: req.params.uid });
        if (!targetUser) return res.status(404).json({ message: "User not found" });

        const isFollowing = targetUser.followers?.includes(requesterId);
        const hasRequested = targetUser.followRequests?.includes(requesterId);

        res.json({
            followersCount: targetUser.followers?.length || 0,
            followingCount: targetUser.following?.length || 0,
            isFollowing: !!isFollowing,
            hasRequested: !!hasRequested
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search Users
router.get('/search/all', async (req, res) => {
    try {
        const { q, requesterId } = req.query;
        if (!q) return res.json([]);
        const users = await User.find({
            $or: [
                { displayName: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } }
            ]
        }).limit(10);
        
        const filteredUsers = users.map(u => filterUserByPrivacy(u, requesterId));
        res.json(filteredUsers);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   POST /api/users/mute
router.post('/mute', async (req, res) => {
    try {
        const { userId, targetUid } = req.body;
        await User.findOneAndUpdate({ firebaseUid: userId }, { $addToSet: { mutedUsers: targetUid } });
        res.json({ success: true, status: 'muted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   POST /api/users/unmute
router.post('/unmute', async (req, res) => {
    try {
        const { userId, targetUid } = req.body;
        await User.findOneAndUpdate({ firebaseUid: userId }, { $pull: { mutedUsers: targetUid } });
        res.json({ success: true, status: 'unmuted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   POST /api/users/block
router.post('/block', async (req, res) => {
    try {
        const { userId, targetUid } = req.body;
        // Add to blocker's blocked list
        await User.findOneAndUpdate({ firebaseUid: userId }, {
            $addToSet: { blockedUsers: targetUid },
            $pull: { following: targetUid, followers: targetUid } // Unfollow logic
        });
        // Remove blocker from target's lists (mutual unfollow)
        await User.findOneAndUpdate({ firebaseUid: targetUid }, {
            $pull: { following: userId, followers: userId }
        });
        res.json({ success: true, status: 'blocked' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   POST /api/users/unblock
router.post('/unblock', async (req, res) => {
    try {
        const { userId, targetUid } = req.body;
        await User.findOneAndUpdate({ firebaseUid: userId }, { $pull: { blockedUsers: targetUid } });
        res.json({ success: true, status: 'unblocked' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   GET /api/users/list/contacts
router.get('/list/contacts', async (req, res) => {
    try {
        const { requesterId } = req.query;
        if (!requesterId) return res.status(400).json({ message: "Requester ID required" });

        const user = await User.findOne({ firebaseUid: requesterId });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Contacts are users you follow
        const contacts = await User.find({ firebaseUid: { $in: user.following } });
        const filteredContacts = contacts.map(c => filterUserByPrivacy(c, requesterId));
        res.json(filteredContacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/users/list/online
router.get('/list/online', async (req, res) => {
    try {
        const { requesterId } = req.query;
        // Get all online users except self
        const onlineUsers = await User.find({ 
            isOnline: true, 
            firebaseUid: { $ne: requesterId } 
        }).limit(20);
        
        const filteredOnline = onlineUsers.map(u => filterUserByPrivacy(u, requesterId));
        res.json(filteredOnline);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
