const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Collection = require('../models/Collection');
const Notification = require('../models/Notification');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/posts/';
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
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|gif|mp4|mov|avi|mkv/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only image and video files are allowed!'));
    }
});

// --- CORE POST ROUTES (PRIORITIZED) ---

// @route   GET /api/posts/saved
router.get('/saved', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: 'UserId required' });
        const posts = await Post.find({ saves: userId, isArchived: { $ne: true } }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   GET /api/posts/trending-hashtags
router.get('/trending-hashtags', async (req, res) => {
    try {
        const posts = await Post.find({ tags: { $exists: true, $not: { $size: 0 } }, isArchived: { $ne: true } });
        const tagCounts = {};
        posts.forEach(post => {
            if (post.tags) {
                post.tags.forEach(tag => {
                    if (tag.label) tagCounts[tag.label] = (tagCounts[tag.label] || 0) + 1;
                });
            }
        });
        const trending = Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        res.json(trending);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   GET /api/posts/user/stats
router.get('/user/stats', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ message: 'UserId required' });

        const posts = await Post.find({ authorId: userId });
        const postIds = posts.map(p => p._id);
        const commentCount = await Comment.countDocuments({ post: { $in: postIds } });

        const stats = await Post.aggregate([
            { $match: { authorId: userId } },
            {
                $group: {
                    _id: null,
                    totalImpressions: { $sum: { $ifNull: ["$views", 0] } },
                    totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
                    totalSaves: { $sum: { $size: { $ifNull: ["$saves", []] } } },
                    avgAestheticScore: { $avg: { $ifNull: ["$aiIntelligence.aestheticScore", 0.5] } },
                    totalPosts: { $sum: 1 }
                }
            }
        ]);

        const categoryStats = await Post.aggregate([
            { $match: { authorId: userId } },
            {
                $group: {
                    _id: "$category",
                    avgLikes: { $avg: { $size: { $ifNull: ["$likes", []] } } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { avgLikes: -1 } }
        ]);

        const sentimentStats = await Post.aggregate([
            { $match: { authorId: userId } },
            {
                $group: {
                    _id: { $ifNull: ["$aiIntelligence.sentiment.label", "neutral"] },
                    count: { $sum: 1 }
                }
            }
        ]);

        const baseStats = stats[0] || {
            totalImpressions: 0,
            totalLikes: 0,
            totalSaves: 0,
            avgAestheticScore: 0,
            totalPosts: 0
        };

        res.json({
            ...baseStats,
            totalComments: commentCount,
            categoryPerformance: categoryStats,
            sentimentDistribution: sentimentStats
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   GET /api/posts
router.get('/', async (req, res) => {
    try {
        const { currentUserId, authorId, page = 1, limit = 10, includeArchived, q, feedContext } = req.query;
        const pageNum = parseInt(page || 1);
        const limitNum = parseInt(limit || 10);
        const skip = (pageNum - 1) * limitNum;

        // 1. Fetch Requesting User Info (Blocks/Following)
        let requester = null;
        if (currentUserId) {
            requester = await User.findOne({ firebaseUid: currentUserId });
        }

        const matchStage = {
            'aiIntelligence.moderationAction': { $ne: 'removed' }
        };

        if (includeArchived !== 'true') matchStage.isArchived = { $ne: true };
        if (authorId) matchStage.authorId = authorId;

        // Eligibility: Hard-Filter Blocks
        if (requester) {
            const excludedIds = [...(requester.blockedUsers || [])];
            // Also find users who have blocked ME
            const usersWhoBlockedMe = await User.find({ blockedUsers: currentUserId }).select('firebaseUid');
            const blockerIds = usersWhoBlockedMe.map(u => u.firebaseUid);
            const totalForbidden = [...new Set([...excludedIds, ...blockerIds])];

            if (totalForbidden.length > 0) {
                matchStage.authorId = { ...matchStage.authorId, $nin: totalForbidden };
            }
        }

        if (q) {
            const searchRegex = new RegExp(q, 'i');
            matchStage.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ];
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'users',
                    localField: 'authorId',
                    foreignField: 'firebaseUid',
                    as: 'authorDetails'
                }
            },
            { $unwind: { path: '$authorDetails', preserveNullAndEmptyArrays: true } },

            // 2. Privacy & Scope Filtering
            {
                $match: {
                    $or: [
                        { 'authorId': currentUserId }, // Self
                        { 'authorDetails.privacy.isPrivate': { $ne: true } }, // Public
                        { 'authorDetails.followers': currentUserId }, // Followed private
                        { 'visibility': 'public' }
                    ]
                }
            },

            // 3. Scoring Engine (Signals Extraction)
            {
                $addFields: {
                    // Signal: Relationship Intensity
                    isFollowed: {
                        $cond: [{ $in: [currentUserId, { $ifNull: ["$authorDetails.followers", []] }] }, 1, 0]
                    },
                    // Signal: Creator Authority
                    isVerified: {
                        $cond: [{ $eq: ["$authorDetails.verification.isVerified", true] }, 1, 0]
                    },
                    // Signal: Engagement Bulk
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    savesCount: { $size: { $ifNull: ["$saves", []] } },

                    // Signal: Aesthetic Intelligence
                    aestheticPower: { $ifNull: ["$aiIntelligence.aestheticScore", 0.5] }
                }
            },
            {
                $addFields: {
                    // Logic: Weighted Scoring
                    rankScore: {
                        $add: [
                            { $multiply: ["$aestheticPower", 40] }, // Aesthetics (40% weight)
                            { $multiply: ["$likesCount", 2] },       // Likes (Popularity)
                            { $multiply: ["$savesCount", 5] },       // Saves (High interest)
                            { $multiply: ["$isFollowed", feedContext === 'explore' ? 10 : 25] },     // Social Proximity
                            { $multiply: ["$isVerified", 15] },     // Quality Assurance

                            // Freshness Decay (Decays over time - 1000 points max, drops off over hours)
                            { $divide: [3000, { $add: [1, { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 3600000] }] }] }
                        ]
                    }
                }
            },
            { $sort: { rankScore: -1, createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            {
                $project: {
                    authorDetails: 0 // Clean up sensitive data before sending
                }
            }
        ];

        const posts = await Post.aggregate(pipeline);
        const totalItems = await Post.countDocuments(matchStage);

        res.json({
            posts,
            hasMore: posts.length === limitNum,
            total: totalItems,
            algorithm: 'G-Network-v3-Integrated'
        });
    } catch (err) {
        console.error("Feed Algorithm Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/posts
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const {
            description, author, authorId, authorAvatar,
            title, category, aspectRatio, altText, visibility,
            allowComments, allowSharing, hideLikeCount, tags,
            blockedKeywords, isBrandedContent, affiliateLink,
            originalPostId, isRepost, image
        } = req.body;

        if (!description && !req.file && !isRepost) {
            return res.status(400).json({ message: "Content or file is required" });
        }

        const newPost = new Post({
            description: description || '',
            title: title || 'New Post',
            category: category || 'Social',
            author: author || 'User',
            authorId,
            authorAvatar: authorAvatar || '',
            image: req.file ? req.file.path.replace(/\\/g, '/') : (image || null),
            aspectRatio: aspectRatio || 'cover',
            altText: altText || '',
            visibility: visibility || 'public',
            allowComments: allowComments !== 'false',
            allowSharing: allowSharing !== 'false',
            hideLikeCount: hideLikeCount === 'true',
            isBrandedContent: isBrandedContent === 'true',
            affiliateLink: affiliateLink || '',
            tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
            blockedKeywords: blockedKeywords ? (typeof blockedKeywords === 'string' ? JSON.parse(blockedKeywords) : blockedKeywords) : [],
            originalPostId: originalPostId || null,
            isRepost: isRepost === 'true' || isRepost === true
        });

        // AI Logic
        try {
            const ContentIntelligenceService = require('../services/aiIntelligence');
            const aiResults = await ContentIntelligenceService.analyzeImage(req.file, description);
            newPost.aiIntelligence = aiResults;
        } catch (aiErr) {
            console.error("AI Analysis failed, using defaults", aiErr);
            newPost.aiIntelligence = { aestheticScore: 0.5, objectsDetected: [], moderationAction: 'none' };
        }

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        console.error("Post creation error:", err);
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/posts/:id
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   PUT /api/posts/:id
// @route   PUT /api/posts/:id
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { description, title, category, visibility, aspectRatio, removeImage } = req.body;
        const updateData = {
            description,
            title,
            category,
            visibility,
            aspectRatio,
            isEdited: true
        };

        if (req.file) {
            updateData.image = req.file.path.replace(/\\/g, '/');
        } else if (removeImage === 'true') {
            updateData.image = '';
        }

        const post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(post);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   DELETE /api/posts/:id
router.delete('/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   PUT /api/posts/:id/archive
router.put('/:id/archive', async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
        res.json(post);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   PUT /api/posts/:id/like
router.put('/:id/like', async (req, res) => {
    try {
        const { userId, userName, userAvatar } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const index = post.likes.indexOf(userId);
        if (index > -1) {
            post.likes.splice(index, 1);
        } else {
            post.likes.push(userId);
            if (post.authorId !== userId) {
                const notif = new Notification({
                    recipient: post.authorId,
                    sender: userId,
                    senderName: userName,
                    senderAvatar: userAvatar,
                    type: 'like',
                    postId: post._id,
                    content: 'liked your post'
                });
                await notif.save();
                const io = req.app.get('socketio');
                if (io) io.to(post.authorId).emit('new_notification', notif);
            }
        }

        await post.save();
        res.json({ likes: post.likes, likesCount: post.likes.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/posts/:id/comments
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.id, parentComment: null })
            .sort({ isPinned: -1, createdAt: -1 })
            .populate({
                path: 'replies',
                populate: { path: 'replies', populate: { path: 'replies' } }
            });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/posts/:id/comment
router.post('/:id/comment', async (req, res) => {
    try {
        const { userId, userName, userAvatar, text, parentCommentId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.blockedKeywords?.some(k => text.toLowerCase().includes(k.toLowerCase()))) {
            return res.status(400).json({ message: 'Comment contains blocked keywords.' });
        }

        const newComment = new Comment({
            post: post._id,
            author: userName,
            authorId: userId,
            authorAvatar: userAvatar,
            text,
            parentComment: parentCommentId || null
        });

        const savedComment = await newComment.save();
        if (parentCommentId) {
            await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: savedComment._id } });
        }

        if (post.authorId !== userId) {
            const notif = new Notification({
                recipient: post.authorId,
                sender: userId,
                senderName: userName,
                type: 'comment',
                postId: post._id,
                content: `commented: "${text.substring(0, 30)}..."`
            });
            await notif.save();
            const io = req.app.get('socketio');
            if (io) io.to(post.authorId).emit('new_notification', notif);
        }

        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/posts/:id/save
router.put('/:id/save', async (req, res) => {
    try {
        const { userId, collectionId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const index = post.saves.indexOf(userId);
        if (index > -1) {
            post.saves.splice(index, 1);
            if (collectionId) {
                await Collection.findByIdAndUpdate(collectionId, { $pull: { posts: post._id } });
            }
        } else {
            post.saves.push(userId);
            if (collectionId) {
                await Collection.findByIdAndUpdate(collectionId, { $push: { posts: post._id } });
            } else {
                let defaultCol = await Collection.findOne({ user: userId, isDefault: true });
                if (!defaultCol) {
                    defaultCol = new Collection({ user: userId, name: 'All Saves', isDefault: true });
                    await defaultCol.save();
                }
                defaultCol.posts.push(post._id);
                await defaultCol.save();
            }
        }

        await post.save();
        res.json({ saves: post.saves });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/posts/:id/share
router.put('/:id/share', async (req, res) => {
    try {
        const { userId, platform } = req.body;
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $inc: { shareCount: 1 },
            $push: { shares: { userId, platform, timestamp: new Date() } }
        }, { new: true });
        res.json({ shareCount: post.shareCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/posts/:id/view
router.put('/:id/view', async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1, impressions: 1 } }, { new: true });
        res.json({ views: post.views });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// @route   GET /api/posts/search
// @desc    Search posts by title, description, or hashtags
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.json([]);
        }

        const searchRegex = new RegExp(q, 'i');

        const posts = await Post.find({
            isArchived: { $ne: true },
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { hashtags: { $in: [searchRegex] } }
            ]
        })
            .limit(20)
            .sort({ createdAt: -1 })
            .select('title description mediaUrl hashtags author createdAt likes comments');

        res.json(posts);
    } catch (err) {
        console.error('Post search error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
