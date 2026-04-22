const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: String,
  description: String,
  type: { type: String, default: 'product' },
  status: { type: Number, default: 1 },
}, { timestamps: true, toJSON: { virtuals: true } });

tagSchema.virtual('id').get(function () { return this._id.toHexString(); });

module.exports = mongoose.model('Tag', tagSchema);
