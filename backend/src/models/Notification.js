const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientRole: { type: String, enum: ['admin', 'staff', 'user'] },
  type: { type: String, required: true },
  channel: { type: String, enum: ['WHATSAPP', 'EMAIL', 'WEB'], required: true },
  message: { type: String },
  status: { type: String, enum: ['SENT', 'FAILED', 'PENDING', 'ACKNOWLEDGED'], default: 'PENDING' },
  delivered: { type: Boolean, default: false },
  opened: { type: Boolean, default: false },
  acknowledged: { type: Boolean, default: false },
  fallbackTriggered: { type: Boolean, default: false },
  sentAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
