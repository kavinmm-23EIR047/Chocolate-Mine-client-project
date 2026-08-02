const mongoose = require('mongoose');
require('dotenv').config();

async function clearAllOrderData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chocolatemine');
    console.log('Connected to MongoDB...');

    const db = mongoose.connection.db;

    const ordersRes = await db.collection('orders').deleteMany({});
    console.log(`Deleted ${ordersRes.deletedCount} items from 'orders'`);

    const inShopRes = await db.collection('inshoporders').deleteMany({});
    console.log(`Deleted ${inShopRes.deletedCount} items from 'inshoporders'`);

    const paymentsRes = await db.collection('payments').deleteMany({});
    console.log(`Deleted ${paymentsRes.deletedCount} items from 'payments'`);

    console.log('🎉 All order & payment data has been completely cleared by Antigravity!');
  } catch (err) {
    console.error('Error clearing data:', err);
  } finally {
    await mongoose.disconnect();
  }
}

clearAllOrderData();
