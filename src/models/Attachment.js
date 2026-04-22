const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: String,
  file_name: String,
  mime_type: String,
  disk: { type: String, default: 'local' },
  path: String,
  asset_url: String,
  original_url: String,
  created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Attachment', attachmentSchema);
