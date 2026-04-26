const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const email = 'mmkavin96@gmail.com';
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`User ${email} not found`);
    } else {
      console.log(`User ${email} found!`);
      console.log('Role:', user.role);
      console.log('Has password?', !!user.password);
      console.log('Password prefix:', user.password ? user.password.substring(0, 4) : 'N/A');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUser();
