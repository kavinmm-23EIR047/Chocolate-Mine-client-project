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
    }
  },
  {
    timestamps: true
  }
);




// ==========================================
// Excel Synchronization Hooks (Fire-and-Forget)
// ==========================================
const excelService = require('../services/excelService');

paymentSchema.post('save', function(doc) {
  if (doc) {
    const modelName = this.constructor.modelName || this.modelName || 'Payment';
    excelService.appendToExcel(modelName, doc)
      .catch(err => console.error("Excel sync error for save:", err.message));
  }
});

paymentSchema.post(['findOneAndUpdate', 'updateOne', 'findByIdAndUpdate'], function(doc) {
  const modelName = this.model?.modelName || 'Payment';
  const query = typeof this.getQuery === 'function' ? this.getQuery() : null;
  
  (async () => {
    try {
      if (doc && doc._id) {
        await excelService.updateInExcel(modelName, doc._id, doc);
      } else if (query && query._id) {
        const updatedDoc = await this.model.findOne(query).lean();
        if (updatedDoc) await excelService.updateInExcel(modelName, query._id, updatedDoc);
      }
    } catch (err) {
      console.error("Excel sync error for update:", err.message);
    }
  })();
});

paymentSchema.post(['findOneAndDelete', 'deleteOne', 'findByIdAndDelete'], function(doc) {
  const modelName = this.model?.modelName || 'Payment';
  const query = typeof this.getQuery === 'function' ? this.getQuery() : null;
  
  (async () => {
    try {
      if (doc && doc._id) {
        await excelService.deleteFromExcel(modelName, doc._id);
      } else if (query && query._id) {
        await excelService.deleteFromExcel(modelName, query._id);
      }
    } catch (err) {
      console.error("Excel sync error for delete:", err.message);
    }
  })();
});

module.exports = mongoose.model('Payment', paymentSchema);
