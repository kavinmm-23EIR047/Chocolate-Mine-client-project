const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../src/models/Product');

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chocolate-mine');
    console.log('Connected to DB');
    
    const id = '69ea5fe80cb14f709bdd5bb1'; // from user's logs
    const product = await Product.findById(id);
    console.log('Product found:', product ? product.name : 'NOT FOUND');
    
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
};

test();
