const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  values: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Setting', settingSchema);
