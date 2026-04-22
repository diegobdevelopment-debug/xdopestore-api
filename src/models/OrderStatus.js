const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  sequence: Number,
  status: { type: Number, default: 1 },
  system_reserve: { type: String, default: '0' },
  color: String,
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('OrderStatus', orderStatusSchema);
