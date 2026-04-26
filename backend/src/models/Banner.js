const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Banner image is required']
  },
  imagePublicId: {
    type: String
  },
  link: {
    type: String,
    trim: true
  },
  bannerType: {
    type: String,
    default: 'home',
    enum: ['home', 'promotion', 'popup']
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Index for active and displayOrder for efficient sorting
bannerSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
