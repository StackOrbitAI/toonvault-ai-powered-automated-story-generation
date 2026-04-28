const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: String,
    coverIcon: String,
    coverBg: String,
    authorId: String,
    authorName: String,
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    status: { type: String, enum: ['Draft', 'Pending', 'Live', 'Flagged'], default: 'Draft' },
    type: { type: String, enum: ['Comic', 'Novel', 'Article'], default: 'Comic' },
    description: String,
    content: String,
    panels: [String], // URLs for AI images
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', StorySchema);
