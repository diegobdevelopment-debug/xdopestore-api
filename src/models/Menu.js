const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  title: { type: String, required: true },
  path: { type: String, default: '/' },
  class: { type: String, default: '0' },
  megamenu: { type: Boolean, default: false },
  status: { type: Number, default: 1 },
  sort_order: { type: Number, default: 0 },
  item: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
