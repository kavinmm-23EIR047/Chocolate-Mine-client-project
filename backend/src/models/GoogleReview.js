const mongoose = require('mongoose');

const DUMMY_NAMES = [
  'John Doe', 'Sarah Smith', 'Michael Johnson', 'Emily Davis', 'David Wilson',
  'Priya Sharma', 'Rahul Verma', 'Anita Menon', 'Vikram Singh', 'Meera Reddy'
];

const googleReviewSchema = new mongoose.Schema(
  {
    reviewId: {
      type: String,
      required: [true, 'Review ID is required'],
      unique: true,
      index: true
    },
    authorName: {
      type: String,
      required: [true, 'Author Name is required'],
      trim: true,
      minLength: [1, 'Author name cannot be empty']
    },
    authorUrl: {
      type: String
    },
    profilePhotoUrl: {
      type: String
    },
    reviewImageUrls: [{
      type: String
    }],
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5']
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minLength: [1, 'Review text cannot be empty']
    },
    time: {
      type: Date,
      required: true
    },
    reviewDateStr: {
      type: String
    },
    language: {
      type: String
    },
    responseFromOwner: {
      text: { type: String },
      time: { type: Date }
    },
    isSynced: {
      type: Boolean,
      default: true
    },
    syncedAt: {
      type: Date,
      default: Date.now
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    source: {
      type: String,
      default: 'apify',
      enum: {
        values: ['apify'],
        message: 'Source must be apify'
      }
    },
    tags: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

googleReviewSchema.pre('save', function(next) {
  const isNextFunc = typeof next === 'function';
  if (this.source === 'dummy') {
    const err = new Error('Cannot save dummy data');
    if (isNextFunc) return next(err);
    throw err;
  }
  
  if (DUMMY_NAMES.includes(this.authorName)) {
    const err = new Error('Cannot save fake/dummy names');
    if (isNextFunc) return next(err);
    throw err;
  }
  
  if (this.rating < 1 || this.rating > 5 || isNaN(this.rating)) {
    const err = new Error('Invalid rating value');
    if (isNextFunc) return next(err);
    throw err;
  }

  if (isNextFunc) {
    next();
  }
});

// Indexes for faster querying
googleReviewSchema.index({ rating: -1 });
googleReviewSchema.index({ time: -1 });
googleReviewSchema.index({ isVisible: 1 });



// ==========================================
// Excel Synchronization Hooks
// ==========================================
const excelService = require('../services/excelService');

googleReviewSchema.post('save', async function(doc) {
  try {
    if (doc) await excelService.appendToExcel(this.constructor.modelName || this.modelName, doc);
  } catch (err) {
    console.error("Excel sync error for save:", err.message);
  }
});

googleReviewSchema.post(['findOneAndUpdate', 'updateOne', 'findByIdAndUpdate'], async function(doc) {
  try {
    const modelName = this.model.modelName;
    const query = this.getQuery();
    if (doc && doc._id) {
      await excelService.updateInExcel(modelName, doc._id, doc);
    } else if (query && query._id) {
      const updatedDoc = await this.model.findOne(query).lean();
      if (updatedDoc) await excelService.updateInExcel(modelName, query._id, updatedDoc);
    }
  } catch (err) {
    console.error("Excel sync error for update:", err.message);
  }
});

googleReviewSchema.post(['findOneAndDelete', 'deleteOne', 'findByIdAndDelete'], async function(doc) {
  try {
    const modelName = this.model.modelName;
    if (doc && doc._id) {
      await excelService.deleteFromExcel(modelName, doc._id);
    } else {
      const query = this.getQuery();
      if (query && query._id) {
         await excelService.deleteFromExcel(modelName, query._id);
      }
    }
  } catch (err) {
    console.error("Excel sync error for delete:", err.message);
  }
});

module.exports = mongoose.model('GoogleReview', googleReviewSchema);
