const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit'] },
  amount: Number,
  description: String,
  date: { type: Date, default: Date.now },
}, { _id: true });

const walletSchema = new mongoose.Schema({
  consumer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [transactionSchema],
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Wallet', walletSchema);
