const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./src/models/Order');

async function inspectOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chocolatemine');
    const order = await Order.findOne({ orderNumber: 'TCM-2026-0072' });
    console.log('Order TCM-2026-0072:', JSON.stringify(order, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectOrder();
