const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['reader', 'creator', 'admin'], default: 'reader' },
    plan: { type: String, enum: ['Free', 'Silver', 'Gold'], default: 'Free' },
    status: { type: String, default: 'active' },
    coins: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    storiesRead: { type: Number, default: 0 },
    aiPanelsUsed: { type: Number, default: 0 },
    articlesGenerated: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', UserSchema);
