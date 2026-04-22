const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  status: { type: Number, default: 1 },
}, { timestamps: true, toJSON: { virtuals: true } });

taxSchema.virtual('id').get(function () { return this._id.toHexString(); });

module.exports = mongoose.model('Tax', taxSchema);
