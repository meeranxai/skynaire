const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: String, required: true }, // User Name
    authorId: { type: String, required: true }, // Firebase UID
    authorAvatar: { type: String },
    text: { type: String, required: true, maxlength: 1000 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: String }], // Array of Firebase UIDs
    reactions: [{
        userId: String,
        type: { type: String, enum: ['👍', '❤️', '😂', '😮', '😢', '😡'] }
    }],
    isPinned: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    moderationStatus: { type: String, enum: ['active', 'hidden', 'removed'], default: 'active' },
    toxicityScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
