const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reporter: { type: String, required: true }, // Firebase UID
    reporterName: { type: String },

    targetId: { type: String, required: true }, // Post ID or User ID being reported
    targetType: { type: String, enum: ['post', 'user', 'comment'], default: 'post' },
    targetOwnerId: { type: String }, // UID of the content owner

    reasonCategory: {
        type: String,
        enum: [
            'spam', 'misinformation', 'nudity', // Tier 1
            'harassment', 'hate_speech', 'violence', 'self_harm', // Tier 2
            'other' // Tier 3
        ],
        required: true
    },

    description: { type: String }, // For Tier 3 custom input
    status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },

    adminNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
