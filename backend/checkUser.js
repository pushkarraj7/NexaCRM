const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find();
    console.log('\n📋 All users in database:');
    console.log(users);
    
    const admin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    console.log('\n🔍 Admin user details:');
    console.log(admin);
    
    if (admin) {
      const testPassword = await admin.matchPassword('admin@123');
      console.log('\n🔐 Password match test:', testPassword);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUser();