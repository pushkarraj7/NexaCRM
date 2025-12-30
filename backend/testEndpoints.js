require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Item = require('./models/Item');
const CustomerItem = require('./models/CustomerItem');

const testEndpoints = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Check Customers
        console.log('📋 Testing Customers Collection:');
        const customers = await Customer.find();
        console.log(`   Found ${customers.length} customers`);
        if (customers.length > 0) {
            console.log(`   First customer: ${customers[0].name} (${customers[0]._id})`);
        } else {
            console.log('   ⚠️  No customers found!');
        }

        // Test 2: Check Items
        console.log('\n📦 Testing Items Collection:');
        const items = await Item.find();
        console.log(`   Found ${items.length} items`);
        if (items.length > 0) {
            console.log(`   First item: ${items[0].name} (${items[0]._id})`);
        } else {
            console.log('   ⚠️  No items found!');
        }

        // Test 3: Check CustomerItems
        console.log('\n🤝 Testing CustomerItems Collection:');
        const agreements = await CustomerItem.find();
        console.log(`   Found ${agreements.length} agreements`);
        if (agreements.length > 0) {
            const first = agreements[0];
            console.log(`   First agreement:`);
            console.log(`      ID: ${first._id}`);
            console.log(`      Customer ID: ${first.customerId}`);
            console.log(`      Item ID: ${first.itemId}`);
            console.log(`      Price: ₹${first.price}`);
            console.log(`      Discount: ${first.discount}%`);
        } else {
            console.log('   ⚠️  No agreements found!');
        }

        // Test 4: Check CustomerItems with population
        console.log('\n🔗 Testing CustomerItems with Population:');
        const populatedAgreements = await CustomerItem.find()
            .populate('customerId', 'name email')
            .populate('itemId', 'name category');
        
        if (populatedAgreements.length > 0) {
            const first = populatedAgreements[0];
            console.log(`   ✅ Population works!`);
            console.log(`      Customer: ${first.customerId?.name || 'NOT POPULATED'}`);
            console.log(`      Item: ${first.itemId?.name || 'NOT POPULATED'}`);
        }

        await mongoose.connection.close();
        console.log('\n🔒 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

testEndpoints();