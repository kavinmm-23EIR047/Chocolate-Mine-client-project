const mongoose = require('mongoose');

async function run() {
  try {
    await mongoose.connect('mongodb+srv://akwebflairtechnologies:Kavin20@cluster0.e8em7w1.mongodb.net/properties');
    
    const categoriesCol = mongoose.connection.collection('categories');
    const dbCats = await categoriesCol.find({}).toArray();
    console.log('--- BACKEND CATEGORIES COLLECTION ---');
    dbCats.forEach(c => console.log(`- name: "${c.name}", label: "${c.label}", active: ${c.active}`));

    const productsCol = mongoose.connection.collection('products');
    const prods = await productsCol.find({}).toArray();
    const prodCatsMap = {};
    prods.forEach(p => {
      let cats = Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []);
      cats.forEach(c => {
        prodCatsMap[c] = (prodCatsMap[c] || 0) + 1;
      });
    });
    console.log('\n--- PRODUCT CATEGORIES IN PRODUCTS COLLECTION ---');
    console.log(prodCatsMap);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
