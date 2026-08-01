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




// ==========================================
// Excel Synchronization Hooks (Fire-and-Forget)
// ==========================================
const excelService = require('../services/excelService');

occasionSchema.post('save', function(doc) {
  if (doc) {
    const modelName = this.constructor.modelName || this.modelName || 'Occasion';
    excelService.appendToExcel(modelName, doc)
      .catch(err => console.error("Excel sync error for save:", err.message));
  }
});

occasionSchema.post(['findOneAndUpdate', 'updateOne', 'findByIdAndUpdate'], function(doc) {
  const modelName = this.model?.modelName || 'Occasion';
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

occasionSchema.post(['findOneAndDelete', 'deleteOne', 'findByIdAndDelete'], function(doc) {
  const modelName = this.model?.modelName || 'Occasion';
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

module.exports = mongoose.model('Occasion', occasionSchema);
