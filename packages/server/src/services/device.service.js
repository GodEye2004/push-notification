const deviceRepo = require("../repositories/device.repo");
const notificationRepo = require("../repositories/notification.repo");
const { getActiveClients } = require("../socket");
const admin = require("firebase-admin");

async function sendNotification(io, { app_id, type, value, notification, data }) {
  let targetDevices = [];
  if (type === "all") {
    targetDevices = await deviceRepo.findAllByApp(app_id);
  } else if (type === "device") {
    const device = await deviceRepo.findByAppAndDevice(app_id, value);
    if (device) targetDevices = [device];
  }

  if (!targetDevices.length) return { socket_sent: [], fcm_sent: [], pending: [] };

  const activeClients = getActiveClients();
  const socketSent = [], fcmSent = [], pending = [];
  const payload = { notification, data, sent_at: new Date() };

  for (const dev of targetDevices) {
    const { device_id: devId, push_token: fcmToken } = dev;
    const isOnline = activeClients.has(devId);

    if (isOnline) {
      io.to(`device_${devId}`).emit("push-notification", payload);
      socketSent.push(devId);
    }

    if (fcmToken) {
      try {
        await admin.messaging().send(buildFcmMessage(fcmToken, notification, data));
        fcmSent.push(devId);
      } catch (err) {
        await handleFcmError(err, devId, app_id, notification, data, isOnline, pending);
      }
    } else if (!isOnline) {
      await notificationRepo.savePending({ app_id, notification, data, device_id: devId });
      pending.push(devId);
    }
  }

  await notificationRepo.saveHistory({ app_id, notification, data, targets_count: targetDevices.length });
  return { socket_sent: socketSent, fcm_sent: fcmSent, pending, total: targetDevices.length };
}

function buildFcmMessage(token, notification, data) {
  return {
    notification: { title: notification.title, body: notification.body },
    android: {
      notification: {
        channelId: "push_notifications_channel_v3",
        priority: "high",
        ...(notification.image ? { imageUrl: notification.image } : {}),
      },
      priority: "high",
    },
    apns: {
      payload: { aps: { alert: { title: notification.title, body: notification.body }, sound: "default", badge: 1 } },
    },
    data: data
      ? { ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])), sent_at: new Date().toISOString() }
      : { sent_at: new Date().toISOString() },
    token,
  };
}

async function handleFcmError(err, devId, app_id, notification, data, isOnline, pending) {
  const invalidCodes = ["messaging/registration-token-not-registered", "messaging/invalid-registration-token"];
  if (invalidCodes.includes(err.code)) {
    await deviceRepo.clearToken(devId);
  } else if (!isOnline) {
    await notificationRepo.savePending({ app_id, notification, data, device_id: devId });
    pending.push(devId);
  }
}

module.exports = { sendNotification };