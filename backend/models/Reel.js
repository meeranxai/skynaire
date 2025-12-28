const mongoose = require('mongoose');

const ReelSchema = new mongoose.Schema({
    author: { type: String, required: true }, // Display Name
    authorId: { type: String, required: true, index: true }, // Firebase UID
    authorAvatar: { type: String },

    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String }, // Poster image
    description: { type: String, default: '' },

    // Technical Metadata
    duration: { type: Number }, // in seconds
    aspectRatio: { type: String, default: '9:16' },

    // Engagement Metrics
    likes: [{ type: String }], // Array of User IDs
    saves: [{ type: String }], // Array of User IDs
    views: { type: Number, default: 0 },
    plays: { type: Number, default: 0 }, // Loop count
    shares: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    // Audio attribution (Phase 2 Stub)
    audio: {
        name: { type: String },
        artist: { type: String },
        originalId: { type: String } // If re-using another reel's audio
    },

    hashtags: [{ type: String }],

    // Moderation & Controls
    visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
    isArchived: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true }

}, { timestamps: true });

ReelSchema.index({ createdAt: -1 });
ReelSchema.index({ authorId: 1 });

module.exports = mongoose.model('Reel', ReelSchema);
