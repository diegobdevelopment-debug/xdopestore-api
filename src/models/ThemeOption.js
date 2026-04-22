const mongoose = require('mongoose');

const themeOptionSchema = new mongoose.Schema({
  options: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('ThemeOption', themeOptionSchema);
