const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    description: { type: String, required: true },
    title: { type: String, default: 'New Post' },
    category: { type: String, default: 'Social' },
    image: { type: String },
    aspectRatio: { type: String, default: 'cover' },
    altText: { type: String, default: '' },
    author: { type: String, required: true },
    authorId: { type: String, required: true, index: true },
    authorAvatar: { type: String },

    // Interactions
    likes: [{ type: String }], // Array of Firebase UIDs
    saves: [{ type: String }], // Array of Firebase UIDs
    shareCount: { type: Number, default: 0 },
    shares: [{
        userId: String,
        platform: { type: String, default: 'internal' },
        timestamp: { type: Date, default: Date.now }
    }],

    // Privacy & Controls
    visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
    allowComments: { type: Boolean, default: true },
    allowSharing: { type: Boolean, default: true },
    hideLikeCount: { type: Boolean, default: false },
    blockedKeywords: [{ type: String }],

    // Pins
    pinnedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],

    // Content Tags (User/Object Tagging)
    tags: [{
        label: String,
        x: Number,
        y: Number,
        userId: String
    }],

    // AI Intelligence (Phase Three)
    aiIntelligence: {
        objectsDetected: [{ label: String, confidence: Number, bbox: [Number] }],
        sceneType: String,
        dominantColors: [String],
        aestheticScore: { type: Number, default: 0.5 },
        sentiment: { score: Number, label: { type: String, enum: ['positive', 'negative', 'neutral'] } },
        riskScore: { type: Number, default: 0 },
        isModerated: { type: Boolean, default: false },
        moderationAction: { type: String, enum: ['none', 'flagged', 'removed'], default: 'none' }
    },

    // Monetization
    isBrandedContent: { type: Boolean, default: false },
    affiliateLink: { type: String, default: '' },

    // Analytics
    views: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    reach: { type: Number, default: 0 },

    isArchived: { type: Boolean, default: false, index: true },
    isEdited: { type: Boolean, default: false },

    // Repost / Attribution
    originalPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    isRepost: { type: Boolean, default: false }
}, { timestamps: true });

PostSchema.index({ createdAt: -1 });
PostSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Post', PostSchema);
