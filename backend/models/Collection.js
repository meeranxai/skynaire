const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
    user: { type: String, required: true }, // Firebase UID
    name: { type: String, required: true, maxlength: 50 },
    description: { type: String, maxlength: 200 },
    coverImage: { type: String },
    isPublic: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

module.exports = mongoose.model('Collection', CollectionSchema);
