const mongoose = require('mongoose');
const { findCountry, findState } = require('../data/countries');

const addressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  street: String,
  city: String,
  // Numeric ids from the static country/state catalog
  country_id: { type: Number, default: null },
  state_id: { type: Number, default: null },
  // Cached human-readable name so list rendering doesn't need a lookup on every read
  country_name: String,
  state_name: String,
  pincode: String,
  phone: String,
  country_code: String,
  is_default: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Expose `country` and `state` as `{ id, name }` objects so the storefront UI,
// which expects `address.state.name` and `address.country.name`, just works.
addressSchema.virtual('country').get(function () {
  if (!this.country_id) return null;
  const fromCatalog = findCountry(this.country_id);
  return { id: this.country_id, name: this.country_name || fromCatalog?.name || '' };
});

addressSchema.virtual('state').get(function () {
  if (!this.state_id) return null;
  const fromCatalog = findState(this.country_id, this.state_id);
  return { id: this.state_id, name: this.state_name || fromCatalog?.name || '' };
});

// Resolve and cache names whenever ids change so the cached fields stay in sync.
addressSchema.pre('save', function (next) {
  if (this.isModified('country_id') || !this.country_name) {
    const c = findCountry(this.country_id);
    if (c) this.country_name = c.name;
  }
  if (this.isModified('state_id') || !this.state_name) {
    const s = findState(this.country_id, this.state_id);
    if (s) this.state_name = s.name;
  }
  next();
});

module.exports = mongoose.model('Address', addressSchema);
