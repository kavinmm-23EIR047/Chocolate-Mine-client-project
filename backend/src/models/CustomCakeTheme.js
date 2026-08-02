const mongoose = require('mongoose');

const customCakeThemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowPhotoUpload: {
    type: Boolean,
    default: false
  },
  basePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  category: [{
    type: String,
    trim: true
  }],
  hasWeights: {
    type: Boolean,
    default: true
  },
  enabledStandardWeights: [{
    type: String,
    trim: true
  }],
  hasCustomWeights: {
    type: Boolean,
    default: false
  },
  customWeightPrices: [{
    weight: { type: String, trim: true },
    price: { type: Number, min: 0 }
  }],
  tiers: {
    tier1: { 
      isActive: { type: Boolean, default: true }, 
      price: { type: Number, default: 0, min: 0 } 
    },
    tier2: { 
      isActive: { type: Boolean, default: false }, 
      price: { type: Number, default: 0, min: 0 } 
    },
    tier3: { 
      isActive: { type: Boolean, default: false }, 
      price: { type: Number, default: 0, min: 0 } 
    }
  },
  flavors: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    weights: [{
      kg: { type: Number, required: true },
      price: { type: Number, required: true }
    }],
    isActive: { type: Boolean, default: true }
  }],
  colors: [{
    name: { type: String, required: true },
    hexCode: { type: String, default: '' },
    images: {
      tier1: { type: String, default: null },
      tier2: { type: String, default: null },
      tier3: { type: String, default: null }
    },
    price: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  }]
}, { timestamps: true });

function toSentenceCase(str) {
  if (!str || typeof str !== 'string') return str;
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

customCakeThemeSchema.pre('save', function(next) {
  if (this.name && typeof this.name === 'string') {
    this.name = toSentenceCase(this.name);
  }
  if (typeof next === 'function') {
    next();
  }
});





// Removed Excel Synchronization Hooks for performance reasons.

module.exports = mongoose.model('CustomCakeTheme', customCakeThemeSchema);
