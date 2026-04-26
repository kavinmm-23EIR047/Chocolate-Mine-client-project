const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  userName: String,
  userImage: String,
  isApproved: {
    type: Boolean,
    default: true, // Auto-approve for now, can be changed to false for moderation
  }
}, { timestamps: true });

// Prevent multiple reviews from same user for same product in same order
reviewSchema.index({ orderId: 1, productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
