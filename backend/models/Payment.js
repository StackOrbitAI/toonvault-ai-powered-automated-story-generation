const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: String,
    amount: Number,
    currency: { type: String, default: 'USD' },
    status: String,
    paymentMethod: String,
    orderId: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);
