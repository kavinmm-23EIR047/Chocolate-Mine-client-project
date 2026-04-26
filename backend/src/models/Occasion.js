const mongoose = require('mongoose');

const occasionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Occasion name is required'],
    unique: true,  // This automatically creates an index - no need for separate schema.index()
    trim: true,
    lowercase: true
  },
  label: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Occasion image is required']
  },
  imagePublicId: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Only index for active field - name index is already created by unique: true
occasionSchema.index({ active: 1 });

module.exports = mongoose.model('Occasion', occasionSchema);