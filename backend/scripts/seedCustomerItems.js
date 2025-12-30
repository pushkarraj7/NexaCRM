require('dotenv').config();
const mongoose = require('mongoose');
const CustomerItem = require('../models/CustomerItem');
const Customer = require('../models/Customer');
const Item = require('../models/Item');

const seedCustomerItems = async () => {
    try {
        // Check if MONGO_URI exists
        if (!process.env.MONGO_URI) {
            console.error('❌ MONGO_URI is not defined in .env file');
            process.exit(1);
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing agreements
        const deletedCount = await CustomerItem.deleteMany({});
        console.log(`🗑️  Cleared ${deletedCount.deletedCount} existing customer-item agreements`);

        // Get one customer and one item
        const customer = await Customer.findOne();
        const item = await Item.findOne();

        if (!customer) {
            console.error('❌ No customers found in database. Please seed customers first.');
            console.log('💡 Run: node scripts/seedUsers.js');
            await mongoose.connection.close();
            process.exit(1);
        }

        if (!item) {
            console.error('❌ No items found in database. Please seed items first.');
            console.log('💡 Run: node scripts/seedItems.js');
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log(`\n📋 Found customer: ${customer.name} (${customer._id})`);
        console.log(`📦 Found item: ${item.name} (${item._id})\n`);

        // Create ONE sample agreement
        const agreement = {
            customerId: customer._id,
            itemId: item._id,
            price: 45,
            discount: 5
        };

        const newAgreement = await CustomerItem.create(agreement);
        console.log('✅ Customer-item agreement created successfully!');
        console.log('\n📄 Agreement Details:');
        console.log(`   Customer: ${customer.name}`);
        console.log(`   Item: ${item.name}`);
        console.log(`   Base Price: ₹${agreement.price}`);
        console.log(`   Discount: ${agreement.discount}%`);
        console.log(`   Final Price: ₹${(agreement.price - (agreement.price * agreement.discount / 100)).toFixed(2)}`);
        console.log(`   Agreement ID: ${newAgreement._id}\n`);

        await mongoose.connection.close();
        console.log('🔒 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding customer-item agreements:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

seedCustomerItems();