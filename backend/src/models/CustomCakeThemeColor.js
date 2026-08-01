const mongoose = require('mongoose');

const customCakeThemeColorSchema = new mongoose.Schema({
  themeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomCakeTheme',
    required: true
  },
  colorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomCakeColor',
    required: true
  },
  images: {
    tier1: { type: String, default: null },
    tier2: { type: String, default: null },
    tier3: { type: String, default: null }
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, { timestamps: true });

customCakeThemeColorSchema.index({ themeId: 1, colorId: 1 }, { unique: true });





// ==========================================
// Excel Synchronization Hooks (Fire-and-Forget)
// ==========================================
const excelService = require('../services/excelService');

customCakeThemeColorSchema.post('save', function(doc) {
  if (doc) {
    const modelName = this.constructor.modelName || this.modelName || 'CustomCakeThemeColor';
    excelService.appendToExcel(modelName, doc)
      .catch(err => console.error("Excel sync error for save:", err.message));
  }
});

customCakeThemeColorSchema.post(['findOneAndUpdate', 'updateOne', 'findByIdAndUpdate'], function(doc) {
  const modelName = this.model?.modelName || 'CustomCakeThemeColor';
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

customCakeThemeColorSchema.post(['findOneAndDelete', 'deleteOne', 'findByIdAndDelete'], function(doc) {
  const modelName = this.model?.modelName || 'CustomCakeThemeColor';
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

module.exports = mongoose.model('CustomCakeThemeColor', customCakeThemeColorSchema);
