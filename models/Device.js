const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    app_id: { type: String, required: true },
    device_id: { type: String, required: true }, // Unique per app really, but compound index below handles it
    platform: { type: String, required: true },
    os_version: String,
    app_version: String,
    device_model: String,
    push_token: String,
    last_seen: { type: Date, default: Date.now }
});

// Ensure device_id is unique per app_id
DeviceSchema.index({ app_id: 1, device_id: 1 }, { unique: true });

module.exports = mongoose.model('Device', DeviceSchema);
