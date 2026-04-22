const mongoose = require('mongoose');

const homepageSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Homepage', homepageSchema);
