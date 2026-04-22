const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  consumer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5 },
  description: String,
  review_image_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment', default: null },
  status: { type: Number, default: 1 },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Review', reviewSchema);
