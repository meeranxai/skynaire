const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    participants: [{
        type: String, // Storing User UIDs (Firebase UIDs or local IDs)
        required: true
    }],
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: new Map()
    },
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        default: ''
    },
    groupAvatar: {
        type: String,
        default: ''
    },
    groupDescription: {
        type: String,
        default: ''
    },
    groupAdmin: {
        type: String, // UID of the group creator
        default: ''
    },
    groupModerators: [{
        type: String // UIDs of group moderators
    }],
    groupSettings: {
        onlyAdminsCanMessage: {
            type: Boolean,
            default: false
        },
        onlyAdminsCanAddMembers: {
            type: Boolean,
            default: true
        },
        onlyAdminsCanEditInfo: {
            type: Boolean,
            default: true
        },
        disappearingMessages: {
            type: Number, // Seconds
            default: 0
        },
        maxMembers: {
            type: Number,
            default: 256
        }
    },
    mutedBy: [{
        type: String // UIDs of users who muted this chat
    }],
    pinnedBy: [{
        type: String // UIDs of users who pinned this chat
    }],
    archivedBy: [{
        type: String // UIDs of users who archived this chat
    }],
    blockedBy: [{
        type: String // UIDs of users who blocked this chat
    }],
    disappearingTimer: {
        type: Number, // Seconds, 0 means off
        default: 0
    },
    pinnedMessages: [{
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        pinnedBy: String,
        pinnedAt: Date
    }],
    chatType: {
        type: String,
        enum: ['direct', 'group', 'broadcast', 'channel'],
        default: 'direct'
    },
    isEncrypted: {
        type: Boolean,
        default: false
    },
    encryptionKey: {
        type: String
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    tags: [String],
    customization: {
        wallpaper: String,
        theme: String,
        nickname: Map // Map of userId -> nickname
    }
});

// Indexes for better performance
ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ isGroup: 1 });
ChatSchema.index({ chatType: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
