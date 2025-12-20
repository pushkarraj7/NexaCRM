const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const users = [
  { email: 'admin@gmail.com', password: 'admin@123', role: 'admin' },
  { email: 'finance@gmail.com', password: 'finance@123', role: 'finance' },
  { email: 'customer@gmail.com', password: 'customer@123', role: 'customer' },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
    
    await User.deleteMany();
    console.log('Existing users deleted');

    // Insert plain text passwords
    await User.insertMany(users);
    
    console.log('✅ Users seeded successfully with plain text passwords!');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};

seedUsers();