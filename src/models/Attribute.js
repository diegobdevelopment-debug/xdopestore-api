const mongoose = require('mongoose');

const attributeValueSchema = new mongoose.Schema({
  value: String,
  hex_color: String,
  slug: String,
}, { _id: true, toJSON: { virtuals: true } });

attributeValueSchema.virtual('id').get(function () { return this._id.toHexString(); });

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: String,
  style: { type: String, enum: ['rectangle', 'circle', 'image', 'dropdown'], default: 'rectangle' },
  status: { type: Number, default: 1 },
  attribute_values: [attributeValueSchema],
  created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Attribute', attributeSchema);
