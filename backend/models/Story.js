const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userDisplayName: {
        type: String,
        required: true
    },
    userAvatar: {
        type: String
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    caption: {
        type: String,
        default: ''
    },
    // Interactive Elements & Overlays
    overlays: [{
        type: {
            type: String, // 'text', 'sticker', 'music'
            enum: ['text', 'sticker', 'music']
        },
        content: String,
        position: {
            x: Number,
            y: Number,
            rotation: Number,
            scale: Number
        },
        style: mongoose.Schema.Types.Mixed
    }],
    stickers: [{
        type: {
            type: String, // 'poll', 'quiz', 'question', 'countdown', 'link'
            enum: ['poll', 'quiz', 'question', 'countdown', 'link']
        },
        question: String,
        options: [String], // For polls/quizzes
        results: mongoose.Schema.Types.Mixed,
        position: { x: Number, y: Number }
    }],
    mentions: [String], // Array of UIDs
    hashtags: [String],
    location: {
        name: String,
        coordinates: [Number]
    },
    link: String,
    // Privacy & Status
    isCloseFriends: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    views: [{
        userId: String,
        viewedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
        // Removed automatic expires to handle Archive/Highlights manually
    }
}, {
    timestamps: true
});

// We'll manage "active" stories via query filtering (createdAt > 24h) 
// to support Highlights and Archive features.
StorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Story', StorySchema);
