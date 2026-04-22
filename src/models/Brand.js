const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  brand_image_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment', default: null },
  meta_title: String,
  meta_description: String,
  status: { type: Number, default: 1 },
  created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Brand', brandSchema);
