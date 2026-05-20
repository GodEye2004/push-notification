const User = require("../models/User");

const findByPhone = (phone) => User.findOne({ phone });
const findById = (id) => User.findById(id);
const create = (data) => User.create(data);

module.exports = { findByPhone, findById, create };