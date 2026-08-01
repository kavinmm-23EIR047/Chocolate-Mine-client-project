const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  image: { 
    type: String,
    required: true
  },
  imagePublicId: { 
    type: String 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Removed Excel Synchronization Hooks for performance reasons.

module.exports = mongoose.model('Addon', addonSchema);
