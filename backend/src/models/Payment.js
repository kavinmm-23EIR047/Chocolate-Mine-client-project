const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },

    razorpayOrderId: {
      type: String,
      required: true
    },

    razorpayPaymentId: {
      type: String,
      default: null
    },

    razorpaySignature: {
      type: String,
      default: null
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: 'INR'
    },

    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created'
    },

    method: {
      type: String,
      default: 'razorpay'
    },

    failureReason: {
      type: String,
      default: null
    },

    failedAttempts: [
      {
        razorpayPaymentId: String,
        errorCode: String,
        errorDescription: String,
        errorReason: String,
        errorSource: String,
        errorStep: String,
        paymentMethod: String,
        failedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);


// Removed Excel Synchronization Hooks for performance reasons.

module.exports = mongoose.model('Payment', paymentSchema);
