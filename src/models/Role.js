const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  guard_name: { type: String, default: 'web' },
  system_reserve: { type: String, default: '0' },
  permissions: [Number],
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Role', roleSchema);
