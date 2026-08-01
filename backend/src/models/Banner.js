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





// ==========================================
// Excel Synchronization Hooks (Fire-and-Forget)
// ==========================================
const excelService = require('../services/excelService');

bannerSchema.post('save', function(doc) {
  if (doc) {
    const modelName = this.constructor.modelName || this.modelName || 'Banner';
    excelService.appendToExcel(modelName, doc)
      .catch(err => console.error("Excel sync error for save:", err.message));
  }
});

bannerSchema.post(['findOneAndUpdate', 'updateOne', 'findByIdAndUpdate'], function(doc) {
  const modelName = this.model?.modelName || 'Banner';
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

bannerSchema.post(['findOneAndDelete', 'deleteOne', 'findByIdAndDelete'], function(doc) {
  const modelName = this.model?.modelName || 'Banner';
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

module.exports = mongoose.model('Banner', bannerSchema);
