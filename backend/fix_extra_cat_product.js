const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb+srv://akwebflairtechnologies:Kavin20@cluster0.e8em7w1.mongodb.net/properties');
    
    const productsCol = mongoose.connection.collection('products');
    const badProd = await productsCol.findOne({ category: 'chocolate-cakes' });
    if (badProd) {
      console.log('Found product with "chocolate-cakes":', badProd._id, badProd.name);
      // Update its category to 'birthday cakes' or standard category
      await productsCol.updateOne({ _id: badProd._id }, { $set: { category: ['birthday cakes'] } });
      console.log('Updated product category to "birthday cakes"');
    } else {
      console.log('No product with category "chocolate-cakes" found');
    }

    // Also check for 'bento-cakes' and update to 'bento cakes'
    const bentoAlias = await productsCol.find({ category: 'bento-cakes' }).toArray();
    for (const p of bentoAlias) {
      await productsCol.updateOne({ _id: p._id }, { $set: { category: ['bento cakes'] } });
      console.log('Updated bento-cakes alias for product:', p.name);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
