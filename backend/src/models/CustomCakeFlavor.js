const mongoose = require('mongoose');

const customCakeFlavorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Vanilla Cakes', 'Chocolate Cakes', 'Red Velvet Cakes', 'Other']
  },
  weights: [{
    kg: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

customCakeFlavorSchema.index({ name: 1, category: 1 }, { unique: true });





// ==========================================
// Excel Synchronization Hooks (Fire-and-Forget)
// ==========================================
const excelService = require('../services/excelService');

customCakeFlavorSchema.post('save', function(doc) {
  if (doc) {
    const modelName = this.constructor.modelName || this.modelName || 'CustomCakeFlavor';
    excelService.appendToExcel(modelName, doc)
      .catch(err => console.error("Excel sync error for save:", err.message));
  }
});

customCakeFlavorSchema.post(['findOneAndUpdate', 'updateOne', 'findByIdAndUpdate'], function(doc) {
  const modelName = this.model?.modelName || 'CustomCakeFlavor';
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

customCakeFlavorSchema.post(['findOneAndDelete', 'deleteOne', 'findByIdAndDelete'], function(doc) {
  const modelName = this.model?.modelName || 'CustomCakeFlavor';
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

module.exports = mongoose.model('CustomCakeFlavor', customCakeFlavorSchema);
