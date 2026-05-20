const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  app_id: { type: String, required: true },
  notification: { type: Object, required: true }, // { title, body, image }
  data: Object,
  device_id: { type: String, default: null }, // null = broadcast record, non-null = per-device pending
  targets_count: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ["sent", "pending", "delivered"],
    default: "sent",
  },
  sent_at: { type: Date, default: Date.now },
});

NotificationSchema.index({ device_id: 1, status: 1 });

module.exports = mongoose.model("Notification", NotificationSchema);


//  save notification datat in mongo db.