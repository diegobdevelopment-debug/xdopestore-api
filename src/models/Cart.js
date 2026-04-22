const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  consumer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variation_id: { type: mongoose.Schema.Types.ObjectId, default: null },
  quantity: { type: Number, default: 1 },
  sub_total: Number,
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Cart', cartSchema);
