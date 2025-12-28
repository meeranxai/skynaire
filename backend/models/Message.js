const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    senderId: {
        type: String, // User UID
        required: true
    },
    text: {
        type: String,
        default: ''
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
    },
    mediaType: {
        type: String,
        enum: ['text', 'image', 'file', 'voice', 'video', 'location', 'contact', 'sticker', 'gif', 'poll'],
        default: 'text'
    },
    mediaUrl: {
        type: String,
        default: ''
    },
    mediaMetadata: {
        filename: String,
        size: Number,
        mimeType: String,
        duration: Number,
        width: Number,
        height: Number,
        thumbnail: String,
        // Location data
        latitude: Number,
        longitude: Number,
        address: String,
        // Contact data
        contactName: String,
        contactPhone: String,
        contactEmail: String,
        // Poll data
        pollQuestion: String,
        pollOptions: [String],
        pollVotes: [{
            userId: String,
            option: Number,
            timestamp: Date
        }],
        pollMultipleChoice: Boolean,
        pollExpiresAt: Date
    },
    reactions: [{
        userId: String,
        emoji: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    mentions: [{
        userId: String,
        displayName: String,
        startIndex: Number,
        endIndex: Number
    }],
    read: {
        type: Boolean,
        default: false
    },
    delivered: {
        type: Boolean,
        default: false
    },
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    forwarded: {
        type: Boolean,
        default: false
    },
    originalSender: {
        type: String // UID of original sender for forwarded messages
    },
    pinned: {
        type: Boolean,
        default: false
    },
    pinnedAt: {
        type: Date
    },
    scheduled: {
        type: Boolean,
        default: false
    },
    scheduledFor: {
        type: Date
    },
    disappearAfter: {
        type: Number, // Seconds after which message disappears
        default: 0
    },
    disappearsAt: {
        type: Date
    },
    encrypted: {
        type: Boolean,
        default: false
    },
    encryptionKey: {
        type: String
    },
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    tags: [String],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better performance
MessageSchema.index({ chatId: 1, timestamp: -1 });
MessageSchema.index({ chatId: 1, text: 'text' });
MessageSchema.index({ senderId: 1, timestamp: -1 });
MessageSchema.index({ scheduled: 1, scheduledFor: 1 });
MessageSchema.index({ disappearsAt: 1 });
MessageSchema.index({ threadId: 1, timestamp: 1 });

// Auto-delete expired messages
MessageSchema.index({ disappearsAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Message', MessageSchema);
