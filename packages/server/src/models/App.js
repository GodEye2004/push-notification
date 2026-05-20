const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    app_id: { type: String, required: true, unique: true },
    api_key: { type: String, required: true },
    app_name: { type: String, required: true },
    package_name: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);

//  this is for store datat in mongo db.