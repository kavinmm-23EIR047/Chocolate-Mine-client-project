const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');
const Review = require('./src/models/Review');

dotenv.config();

const syncRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Syncing ${products.length} products...`);

    for (const product of products) {
      const stats = await Review.aggregate([
        { $match: { productId: product._id, isApproved: true } },
        {
          $group: {
            _id: '$productId',
            nRating: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        }
      ]);

      if (stats.length > 0) {
        await Product.findByIdAndUpdate(product._id, {
          ratingsCount: stats[0].nRating,
          ratingsAverage: Number(stats[0].avgRating.toFixed(1))
        });
        console.log(`Updated ${product.name}: ${stats[0].avgRating.toFixed(1)} stars (${stats[0].nRating} reviews)`);
      } else {
        await Product.findByIdAndUpdate(product._id, {
          ratingsCount: 0,
          ratingsAverage: 0
        });
        console.log(`Reset ${product.name}: 0 stars`);
      }
    }

    console.log('Sync complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing:', err);
    process.exit(1);
  }
};

syncRatings();
