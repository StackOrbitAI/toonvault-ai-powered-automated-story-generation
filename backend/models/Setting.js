const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    label: { type: String },
    type: { type: String, default: 'text' } // text, boolean, number
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
