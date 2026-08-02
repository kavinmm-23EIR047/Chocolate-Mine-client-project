require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not found');
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('Connected to DB');

    // Update Desserts category subcategories
    const dessertCat = await Category.findOne({ name: { $regex: 'dessert', $options: 'i' } });
    if (dessertCat) {
      dessertCat.subCategories = ['mini-cakes', 'cookies', 'tres-leches', 'brownie'];
      await dessertCat.save();
      console.log('Updated Desserts subcategories:', dessertCat.subCategories);
    } else {
      console.log('Desserts category not found, creating or skipping...');
    }

    // Update Birthday Cakes category subcategories
    const birthdayCat = await Category.findOne({ name: { $regex: 'birthday', $options: 'i' } });
    if (birthdayCat) {
      birthdayCat.subCategories = ['vanilla-cakes', 'chocolate-cakes', 'red-velvet-cakes'];
      await birthdayCat.save();
      console.log('Updated Birthday Cakes subcategories:', birthdayCat.subCategories);
    }

  } catch (err) {
    console.error('Error seeding subcategories:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
