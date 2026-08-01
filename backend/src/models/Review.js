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





// ==========================================
// Excel Synchronization Hooks (Fire-and-Forget)
// ==========================================
const excelService = require('../services/excelService');

reviewSchema.post('save', function(doc) {
  if (doc) {
    const modelName = this.constructor.modelName || this.modelName || 'Review';
    excelService.appendToExcel(modelName, doc)
      .catch(err => console.error("Excel sync error for save:", err.message));
  }
});

reviewSchema.post(['findOneAndUpdate', 'updateOne', 'findByIdAndUpdate'], function(doc) {
  const modelName = this.model?.modelName || 'Review';
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

reviewSchema.post(['findOneAndDelete', 'deleteOne', 'findByIdAndDelete'], function(doc) {
  const modelName = this.model?.modelName || 'Review';
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

module.exports = mongoose.model('Review', reviewSchema);
