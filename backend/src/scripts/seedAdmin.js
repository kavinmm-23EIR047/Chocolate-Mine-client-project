const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // 2. Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      console.log('No admin found. Creating Super Admin...');
      
      await User.create({
        name: 'Super Admin',
        email: 'admin@chocolatemine.com',
        password: 'Admin@123',
        role: 'admin',
        active: true,
        isVerified: true,
        provider: 'local'
      });

      console.log('✅ Super Admin created successfully!');
    } else {
      console.log('ℹ️ Admin already exists. Skipping seed.');
    }

    // 3. Exit
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
