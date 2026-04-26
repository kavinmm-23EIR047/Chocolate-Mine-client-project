const mongoose = require('mongoose');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const products = await Product.find({});
    console.log(`Checking ${products.length} products`);

    for (const p of products) {
      console.log(`Product: ${p.name}, Image: ${p.image}`);
      let newImage = p.image;
      
      if (!p.image || p.image === 'cake.jpg' || p.image.includes('cake.jpg')) {
        newImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800';
      } else if (p.image === 'choco-box.jpg' || p.image.includes('choco-box.jpg')) {
        newImage = 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800';
      } else if (p.image.startsWith('http://res.cloudinary.com')) {
        newImage = p.image.replace('http://', 'https://');
      }

      if (newImage !== p.image) {
        p.image = newImage;
        await p.save();
        console.log(`Updated product: ${p.name} -> ${newImage}`);
      }
    }

    console.log('Finished fixing images');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixImages();
