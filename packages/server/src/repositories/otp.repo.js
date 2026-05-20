const OTP = require("../models/OTP");

const upsert = (phone, code, expires_at) =>
  OTP.findOneAndUpdate({ phone }, { code, expires_at }, { upsert: true });

const findValid = (phone, code) =>
  OTP.findOne({ phone, code });

const deleteById = (id) =>
  OTP.deleteOne({ _id: id });

module.exports = { upsert, findValid, deleteById };