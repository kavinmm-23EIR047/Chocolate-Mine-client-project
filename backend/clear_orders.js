const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./src/models/Order');
const InShopOrder = require('./src/models/InShopOrder');

async function clearOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chocolatemine');
    console.log('Connected to MongoDB...');

    const orderRes = await Order.deleteMany({});
    console.log(`Deleted ${orderRes.deletedCount} online orders from 'orders' collection.`);

    const inShopRes = await InShopOrder.deleteMany({});
    console.log(`Deleted ${inShopRes.deletedCount} in-shop orders from 'inshoporders' collection.`);

    console.log('✅ All order data deleted successfully!');
  } catch (err) {
    console.error('❌ Error clearing orders:', err);
  } finally {
    await mongoose.disconnect();
  }
}

clearOrders();
