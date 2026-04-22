const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: String,
  phone: String,
  country_code: String,
  is_default: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Address', addressSchema);
