const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  content: String,
  blog_thumbnail_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment', default: null },
  is_featured: { type: Boolean, default: false },
  is_sticky: { type: Boolean, default: false },
  status: { type: Number, default: 1 },
  meta_title: String,
  meta_description: String,
  meta_keywords: String,
  og_title: String,
  og_description: String,
  canonical_url: String,
  robots: { type: String, default: 'index, follow' },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  tags: [String],
  created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Blog', blogSchema);
