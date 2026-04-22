const mongoose = require('mongoose');

const shippingRuleSchema = new mongoose.Schema({
  name: String,
  type: String,
  amount: Number,
  min_weight: Number,
  max_weight: Number,
}, { _id: true });

const shippingSchema = new mongoose.Schema({
  status: { type: Number, default: 1 },
  country_id: Number,
  country: String,
  shipping_rules: [shippingRuleSchema],
  created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Shipping', shippingSchema);
