const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

// Webhook or Capture simulation
router.post('/capture', auth, async (req, res) => {
    try {
        const payment = new Payment({
            userId: req.user.id,
            username: req.user.username,
            ...req.body
        });
        await payment.save();
        res.json({ success: true, payment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
