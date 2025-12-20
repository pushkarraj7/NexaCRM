const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('../models/Item');

dotenv.config();

const items = [
  {
    name: 'Full Cream Milk',
    description: 'High quality full cream milk',
    price: 60,
    status: 'active',
  },
  {
    name: 'Toned Milk',
    description: 'Low fat toned milk',
    price: 50,
    status: 'active',
  },
  {
    name: 'Double Toned Milk',
    description: 'Very low fat milk',
    price: 45,
    status: 'active',
  },
  {
    name: 'Buttermilk',
    description: 'Fresh buttermilk',
    price: 30,
    status: 'active',
  },
];

const seedItems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Delete existing items
    await Item.deleteMany();
    console.log('Existing items deleted');

    // Insert new items
    await Item.insertMany(items);

    console.log('✅ Items seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};

seedItems();