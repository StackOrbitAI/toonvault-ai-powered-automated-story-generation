const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Story = require('../models/Story');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.countDocuments();
        const stories = await Story.countDocuments();
        const payments = await Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
        const views = await Story.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]);

        res.json({
            users,
            stories,
            revenue: payments[0]?.total || 0,
            views: views[0]?.total || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
