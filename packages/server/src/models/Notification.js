const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    app_id: { type: String, required: true },
    notification: { type: Object, required: true }, // { title, body, ... }
    data: Object, // Custom data payload
    targets_count: Number,
    status: String,
    sent_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
