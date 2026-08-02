const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./src/models/Order');

async function fixPhotoOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chocolatemine');
    console.log('Connected to MongoDB');

    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100);
    console.log(`Found ${orders.length} recent orders`);

    let updatedCount = 0;
    for (const order of orders) {
      let modified = false;
      for (const item of order.items) {
        const name = (item.name || '').toLowerCase();
        const theme = (item.customDetails?.designTheme || '').toLowerCase();
        
        // If cake is a photo print cake or item.image is a custom uploaded photo
        if (name.includes('photo') || theme.includes('photo') || (item.image && item.image.includes('custom-cakes'))) {
          if (!item.customDetails) {
            item.customDetails = {};
          }
          
          const photoUrl = item.customDetails.photoReferenceUrl || item.customDetails.photoUrl || item.image;
          if (photoUrl) {
            item.customDetails.photoReferenceUrl = photoUrl;
            item.customDetails.photoUrl = photoUrl;
            item.customDetails.photo = photoUrl;
            order.markModified('items');
            modified = true;
          }
        }
      }
      if (modified) {
        await order.save();
        updatedCount++;
        console.log(`Updated Order #${order.orderNumber}`);
      }
    }
    console.log(`Done! Updated ${updatedCount} orders.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

fixPhotoOrders();
