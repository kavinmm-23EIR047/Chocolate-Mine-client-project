const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  label: {
    type: String,
    trim: true
  },
  subCategories: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  image: {
    type: String,
    required: [true, 'Category image is required']
  },
  imagePublicId: { type: String },
  categoryType: {
    type: String,
    enum: ['ordinary', 'custom', 'both'],
    default: 'both'
  },
  active: { type: Boolean, default: true },
  allowCakeMessage: { type: Boolean, default: false }
}, { timestamps: true });





// Removed Excel Synchronization Hooks for performance reasons.

module.exports = mongoose.model('Category', categorySchema);
