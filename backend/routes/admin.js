const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Story = require('../models/Story');
const Payment = require('../models/Payment');
const Setting = require('../models/Setting');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Stats
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.countDocuments();
        const stories = await Story.countDocuments();
        const payments = await Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
        const views = await Story.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
        res.json({ users, stories, revenue: payments[0]?.total || 0, views: views[0]?.total || 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// All Users
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ban/Unban user
router.patch('/users/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// All stories
router.get('/stories', auth, adminOnly, async (req, res) => {
    try {
        const stories = await Story.find().sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update story status
router.patch('/stories/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const story = await Story.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(story);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Transactions
router.get('/transactions', auth, adminOnly, async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 }).limit(50);
        res.json(payments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Settings
router.get('/settings', auth, adminOnly, async (req, res) => {
    try {
        let settings = await Setting.find();
        if (settings.length === 0) {
            // Seed default settings
            const defaults = [
                { key: 'show_creator_popup', value: 'true', label: 'Show Creator Popup', type: 'boolean' },
                { key: 'site_name', value: 'ToonVault', label: 'Site Name', type: 'text' },
                { key: 'maintenance_mode', value: 'false', label: 'Maintenance Mode', type: 'boolean' },
                { key: 'free_episode_interval_hrs', value: '3', label: 'Free Episode Interval (Hrs)', type: 'number' }
            ];
            await Setting.insertMany(defaults);
            settings = await Setting.find();
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update Setting
router.post('/settings', auth, adminOnly, async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await Setting.findOneAndUpdate({ key }, { value }, { new: true, upsert: true });
        res.json(setting);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get API Keys status for Admin UI
router.get('/apikeys', auth, adminOnly, async (req, res) => {
    // Only return the keys to authorized admins
    res.json({
        mistral: process.env.MISTRAL_API_KEY || "",
        runware: process.env.RUNWARE_API_KEY || "",
        runware_model: process.env.RUNWARE_MODEL || "civitai:133005@78200",
        gemini: process.env.GEMINI_API_KEY || "",
        openrouter: process.env.OPENROUTER_API_KEY || "",
        paypalClientId: process.env.PAYPAL_CLIENT_ID || "",
        paypalSecret: process.env.PAYPAL_SECRET || ""
    });
});

module.exports = router;
