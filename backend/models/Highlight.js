const mongoose = require('mongoose');

const HighlightSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    coverUrl: {
        type: String,
        default: ''
    },
    storyIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Highlight', HighlightSchema);
