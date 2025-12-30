const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('../models/Item');

dotenv.config();

const items = [
  {
    itemCode: 'ITEM001',
    itemCategory: 'Dairy',
    name: 'Full Cream Milk',
    unit: 'ltr',
    quantity: 100,
    mrp: 60,
    hsnCode: '0401',
    tax: 5,
    status: 'active',
  },
  {
    itemCode: 'ITEM002',
    itemCategory: 'Dairy',
    name: 'Toned Milk',
    unit: 'ltr',
    quantity: 150,
    mrp: 50,
    hsnCode: '0401',
    tax: 5,
    status: 'active',
  },
  {
    itemCode: 'ITEM003',
    itemCategory: 'Dairy',
    name: 'Double Toned Milk',
    unit: 'ltr',
    quantity: 120,
    mrp: 45,
    hsnCode: '0401',
    tax: 5,
    status: 'active',
  },
  {
    itemCode: 'ITEM004',
    itemCategory: 'Dairy',
    name: 'Buttermilk',
    unit: 'ltr',
    quantity: 80,
    mrp: 30,
    hsnCode: '0403',
    tax: 5,
    status: 'active',
  },
  {
    itemCode: 'ITEM005',
    itemCategory: 'Dairy',
    name: 'Curd',
    unit: 'kg',
    quantity: 50,
    mrp: 55,
    hsnCode: '0406',
    tax: 5,
    status: 'active',
  },
  {
    itemCode: 'ITEM006',
    itemCategory: 'Dairy',
    name: 'Paneer',
    unit: 'kg',
    quantity: 30,
    mrp: 350,
    hsnCode: '0406',
    tax: 12,
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
    console.log(`📦 Seeded ${items.length} items`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};

seedItems();