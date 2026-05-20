const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

//  this is for store user data in mongo db.