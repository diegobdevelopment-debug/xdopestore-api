const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  status: { type: Number, default: 1 },
  type: String,
  category_image_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment', default: null },
  category_icon_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment', default: null },
  meta_title: String,
  meta_description: String,
  created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Category', categorySchema);
