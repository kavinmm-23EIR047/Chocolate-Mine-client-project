require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

const deleteAllOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Order.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} orders.`);

    process.exit(0);
  } catch (error) {
    console.error('Deletion failed:', error);
    process.exit(1);
  }
};

deleteAllOrders();
