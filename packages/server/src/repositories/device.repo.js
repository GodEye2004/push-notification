const Device = require("../models/Device");

const findByAppAndDevice = (app_id, device_id) =>
  Device.findOne({ app_id, device_id });

const findAllByApp = (app_id) =>
  Device.find({ app_id });

const upsert = (app_id, device_id, fields) =>
  Device.findOneAndUpdate(
    { app_id, device_id },
    { ...fields, last_seen: new Date() },
    { upsert: true, new: true }
  );

const updateToken = (app_id, device_id, push_token) =>
  Device.findOneAndUpdate(
    { app_id, device_id },
    { push_token, last_seen: new Date() }
  );

const clearToken = (device_id) =>
  Device.updateOne({ device_id }, { $unset: { push_token: 1 } });

const countByApp = (app_id) =>
  Device.countDocuments({ app_id });

module.exports = { findByAppAndDevice, findAllByApp, upsert, updateToken, clearToken, countByApp };