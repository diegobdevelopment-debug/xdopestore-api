const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: null, trim: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    consumer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // status: 0 = pending (no answer), 1 = answered. Kept as a Number to match the
    // dashboard's serializable-status convention used elsewhere.
    status: { type: Number, default: 0 },
    total_likes: { type: Number, default: 0 },
    total_dislikes: { type: Number, default: 0 },
    // Per-user reactions: { [userId]: 'liked' | 'disliked' }
    reactions: { type: Map, of: String, default: {} },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

module.exports = mongoose.model('Question', questionSchema);
