const mongoose = require('mongoose');

const compareSchema = new mongoose.Schema({
  consumer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Compare', compareSchema);
