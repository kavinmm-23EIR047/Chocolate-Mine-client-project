const mongoose = require('mongoose');

const customCakeColorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  hexCode: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });





// Removed Excel Synchronization Hooks for performance reasons.

module.exports = mongoose.model('CustomCakeColor', customCakeColorSchema);
