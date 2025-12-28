const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Reel = require('../models/Reel');
const User = require('../models/User');

// --- Multer Config for Video Uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Create directory if it doesn't exist
        const uploadDir = 'uploads/reels/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit for videos
    fileFilter: (req, file, cb) => {
        const filetypes = /mp4|mov|avi|mkv|webm/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype.startsWith('video/');
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only video files are allowed!'));
    }
});


// @route   GET /api/reels/feed
// @desc    Get reels feed (Algorithm v1: Recent Public + Followed)
router.get('/feed', async (req, res) => {
    try {
        const { userId, page = 1, limit = 5 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Basic Filtering
        let query = { isArchived: false, visibility: 'public' };

        // If user is logged in, we could prioritize followed users (Phase 2)
        // For Phase 1, strictly chronological reverse sorted

        const reels = await Reel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json(reels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/reels
// @desc    Upload a new Reel
router.post('/', upload.single('video'), async (req, res) => {
    try {
        const { description, authorId, author, authorAvatar, duration, aspectRatio } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Video file is required" });
        }

        const newReel = new Reel({
            author: author || 'User',
            authorId,
            authorAvatar: authorAvatar || '',
            videoUrl: req.file.path.replace(/\\/g, '/'),
            description: description || '',
            duration: duration ? parseFloat(duration) : 0,
            aspectRatio: aspectRatio || '9:16'
        });

        const savedReel = await newReel.save();

        // Update User's reel count (if we had that field, optional for now)

        res.status(201).json(savedReel);
    } catch (err) {
        console.error("Reel upload error:", err);
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/reels/:id/like
// @desc    Toggle like on a reel
router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const reel = await Reel.findById(req.params.id);

        if (!reel) return res.status(404).json({ message: "Reel not found" });

        const index = reel.likes.indexOf(userId);
        if (index > -1) {
            reel.likes.splice(index, 1);
        } else {
            reel.likes.push(userId);
        }

        await reel.save();
        res.json({ likes: reel.likes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/reels/:id/view
// @desc    Increment view count
router.post('/:id/view', async (req, res) => {
    try {
        const reel = await Reel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        res.json({ views: reel?.views });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/reels/user/:userId
// @desc    Get reels by a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const reels = await Reel.find({
            authorId: req.params.userId,
            isArchived: false
        }).sort({ createdAt: -1 });
        res.json(reels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
