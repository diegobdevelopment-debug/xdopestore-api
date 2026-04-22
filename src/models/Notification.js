const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notifiable_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  read_at: { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Notification', notificationSchema);
