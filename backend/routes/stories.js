const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Story Media (Images/Videos)
const storage = multer.diskStorage({
    destination: './uploads/stories/',
    filename: function (req, file, cb) {
        cb(null, 'story-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images and Videos Only!');
        }
    }
}).single('media');

// Create directory for stories if it doesn't exist
if (!fs.existsSync('./uploads/stories/')) {
    fs.mkdirSync('./uploads/stories/', { recursive: true });
}

const Highlight = require('../models/Highlight');

// ... (Multer & directory setup remains same) ...

// @route   POST /api/stories
// @desc    Upload a new story with interactive elements
router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err });
        if (!req.file) return res.status(400).json({ message: 'No media uploaded' });

        const {
            userId, userDisplayName, userAvatar, caption,
            overlays, stickers, mentions, hashtags, link, isCloseFriends
        } = req.body;

        if (!userId) return res.status(400).json({ message: 'userId is required' });

        const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(req.file.originalname);
        const mediaType = isVideo ? 'video' : 'image';

        const newStory = new Story({
            userId,
            userDisplayName: userDisplayName || 'User',
            userAvatar,
            mediaUrl: `/uploads/stories/${req.file.filename}`,
            mediaType,
            caption: caption || '',
            // Parse complex objects if sent as strings (typical for FormData)
            overlays: overlays ? JSON.parse(overlays) : [],
            stickers: stickers ? JSON.parse(stickers) : [],
            mentions: mentions ? JSON.parse(mentions) : [],
            hashtags: hashtags ? JSON.parse(hashtags) : [],
            link: link || '',
            isCloseFriends: isCloseFriends === 'true'
        });

        try {
            const savedStory = await newStory.save();
            res.status(201).json(savedStory);

            const io = req.app.get('socketio');
            if (io) io.emit('new_story', savedStory);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
});

// @route   GET /api/stories
// @desc    Get active (24h) stories from followed users and self
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: 'userId is required' });

        const user = await User.findOne({ firebaseUid: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const following = [...user.following, userId];

        const stories = await Story.find({
            userId: { $in: following },
            isArchived: false,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).sort({ createdAt: -1 });

        const groupedStories = {};
        stories.forEach(story => {
            if (!groupedStories[story.userId]) {
                groupedStories[story.userId] = {
                    userId: story.userId,
                    userDisplayName: story.userDisplayName,
                    userAvatar: story.userAvatar,
                    stories: []
                };
            }
            groupedStories[story.userId].stories.push(story);
        });

        res.json(Object.values(groupedStories));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/stories/archive/:userId
// @desc    Get all stories for a user (Archive)
router.get('/archive/:userId', async (req, res) => {
    try {
        const stories = await Story.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/stories/:id/view
// @desc    Mark story as viewed
router.put('/:id/view', async (req, res) => {
    try {
        const { userId } = req.body;
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });

        const hasViewed = story.views.some(v => v.userId === userId);
        if (userId && !hasViewed) {
            story.views.push({ userId, viewedAt: new Date() });
            await story.save();
        }
        res.json(story);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// HIGHLIGHTS ROUTES
// @route   POST /api/stories/highlights
router.post('/highlights', async (req, res) => {
    try {
        const { userId, title, coverUrl, storyIds } = req.body;
        const highlight = new Highlight({ userId, title, coverUrl, storyIds });
        await highlight.save();
        res.status(201).json(highlight);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/stories/highlights/:userId
router.get('/highlights/:userId', async (req, res) => {
    try {
        const highlights = await Highlight.find({ userId: req.params.userId }).populate('storyIds');
        res.json(highlights);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/stories/:id/archive
// @desc    Toggle archive status for a story
router.put('/:id/archive', async (req, res) => {
    try {
        const { userId } = req.body;
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: 'Story not found' });

        if (story.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        story.isArchived = !story.isArchived;
        await story.save();
        res.json({ success: true, isArchived: story.isArchived });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
