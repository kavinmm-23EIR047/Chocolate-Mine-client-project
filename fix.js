const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function fixOldOrders() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chocolatemine';
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB.');

    const Order = require('./backend/src/models/Order');

    const result = await Order.updateMany(
      {
        paymentMethod: 'ONLINE',
        paymentStatus: { $in: ['pending', 'failed'] },
        orderStatus: 'confirmed'
      },
      {
        $set: { orderStatus: 'awaiting_payment' }
      }
    );

    console.log(`Successfully fixed ${result.modifiedCount} old orders!`);
    console.log('These orders are now marked as "awaiting_payment" so they will not appear in the Staff queue.');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error fixing orders:', error);
    mongoose.connection.close();
  }
}

fixOldOrders();
