const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  country_code: String,
  status: { type: Number, default: 1 },
  system_reserve: { type: String, default: '0' },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  profile_image_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment', default: null },
  email_verified_at: Date,
  otp: String,
  otp_expires_at: Date,
}, { timestamps: true, toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.password; return ret; } } });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
