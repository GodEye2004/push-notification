const appRepo = require("../repositories/app.repo");
const notificationRepo = require("../repositories/notification.repo");
const { sendNotification } = require("../services/notification.service");

// io is injected at startup — see routes setup below
let _io;
const setIo = (io) => { _io = io; };

const send = async (req, res) => {
  const { app_id, type, value, notification, data } = req.body;

  if (!app_id || !notification?.title || !notification?.body) {
    return res.status(400).json({ error: "app_id, notification.title and notification.body are required" });
  }

  const foundApp = await appRepo.findById(app_id);
  if (!foundApp) return res.status(404).json({ error: "App not found" });

  try {
    const result = await sendNotification(_io, { app_id, type, value, notification, data });
    res.json({ status: "queued", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPending = async (req, res) => {
  const { device_id } = req.params;
  try {
    const pending = await notificationRepo.findPending(device_id);
    res.json(pending);
    if (pending.length > 0) await notificationRepo.markDelivered(device_id);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const { getActiveClients } = require("../socket");
    const activeClients = getActiveClients();
    const history = await notificationRepo.getHistory();
    res.json({ status: "online", online_devices: Array.from(activeClients.keys()), online_count: activeClients.size, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { send, getPending, getStatus, setIo };