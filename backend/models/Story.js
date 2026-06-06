const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: String,
  isAdult: { type: Boolean, default: true },
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
    isAgeRestricted: { type: Boolean, default: false },
    description: String,
    content: String,
    characterSeed: { type: Number }, // To maintain visual consistency across episodes
    panels: [String], // URLs for AI images (Episode 1)
    nodes: [{
        id: { type: String, required: true },
        type: { type: String, enum: ['scene', 'choice'], default: 'scene' },
        label: String, // 'Scene 1', 'A', etc.
        title: String,
        description: String,
        panels: [String],
        content: String,
        nextNodes: [String], // IDs of children nodes
        status: { type: String, enum: ['locked', 'unlocked', 'read'], default: 'locked' },
        isPopular: { type: Boolean, default: false },
        isAgeRestricted: { type: Boolean, default: false },
        creatorPick: { type: Boolean, default: false },
        authorId: String,
        authorName: String,
        x: Number, // Position on map
        y: Number
    }],
    episodes: [{
        number: Number,
        title: String,
        description: String,
        panels: [String],       // Direct panel image URLs for this episode
        content: String,        // JSON array of { speaker, text, imageUrl } for quote overlays
        choices: [{             // Interactive voting options for next episode
            text: String,
            votes: { type: Number, default: 0 }
        }],
        scenes: [{
            number: Number,
            title: String,
            panels: [String],
            content: String, // JSON string of panel text/prompts
            choicePrompts: [{
                label: String,
                title: String,
                desc: String,
                targetScene: Number
            }]
        }],
        createdAt: { type: Date, default: Date.now }
    }],
    storyMapData: String,       // JSON string of story map nodes for Quest Map visualization
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', StorySchema);
