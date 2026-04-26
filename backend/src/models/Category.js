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
  image: {
    type: String,
    required: [true, 'Category image is required']
  },
  imagePublicId: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
