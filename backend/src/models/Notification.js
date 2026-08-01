const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientRole: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' },
  title: { type: String }, // Direct title for the notification
  type: { type: String, required: true }, // The type (e.g., 'order_confirmed', 'low_stock', etc.)
  channel: { type: String, enum: ['WHATSAPP', 'EMAIL', 'WEB'], default: 'WEB' },
  message: { type: String },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }, // Direct metadata object
  isRead: { type: Boolean, default: false }, // Read status
  status: { type: String, enum: ['SENT', 'FAILED', 'PENDING', 'ACKNOWLEDGED'], default: 'PENDING' },
  delivered: { type: Boolean, default: false },
  opened: { type: Boolean, default: false }, // Legacy field, synced with isRead
  acknowledged: { type: Boolean, default: false },
  fallbackTriggered: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Sync isRead and opened for full backward compatibility
notificationSchema.pre('save', function (next) {
  if (this.isModified('isRead')) {
    this.opened = this.isRead;
  } else if (this.isModified('opened')) {
    this.isRead = this.opened;
  }
  if (typeof next === 'function') {
    next();
  }
});





// ==========================================
// Excel Synchronization Hooks (Fire-and-Forget)
// ==========================================
const excelService = require('../services/excelService');

notificationSchema.post('save', function(doc) {
  if (doc) {
    const modelName = this.constructor.modelName || this.modelName || 'Notification';
    excelService.appendToExcel(modelName, doc)
      .catch(err => console.error("Excel sync error for save:", err.message));
  }
});

notificationSchema.post(['findOneAndUpdate', 'updateOne', 'findByIdAndUpdate'], function(doc) {
  const modelName = this.model?.modelName || 'Notification';
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

notificationSchema.post(['findOneAndDelete', 'deleteOne', 'findByIdAndDelete'], function(doc) {
  const modelName = this.model?.modelName || 'Notification';
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

module.exports = mongoose.model('Notification', notificationSchema);
