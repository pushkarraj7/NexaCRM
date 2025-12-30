// Save this as: backend/debugCustomer.js
// Run with: node debugCustomer.js

require('dotenv').config();
const mongoose = require('mongoose');

console.log('='.repeat(60));
console.log('COMPREHENSIVE CUSTOMER DEBUG SCRIPT');
console.log('='.repeat(60));

// Test 1: Check bcryptjs installation
console.log('\n📦 TEST 1: Checking bcryptjs...');
try {
    const bcrypt = require('bcryptjs');
    console.log('✅ bcryptjs loaded successfully');
    // Test bcrypt functionality
    const testSalt = bcrypt.genSaltSync(10);
    const testHash = bcrypt.hashSync('test', testSalt);
    console.log('   Bcrypt hash test:', testHash.substring(0, 20) + '...');
} catch (error) {
    console.log('❌ bcryptjs not found:', error.message);
    process.exit(1);
}

// Test 2: Check mongoose
console.log('\n📦 TEST 2: Checking mongoose...');
try {
    console.log('✅ Mongoose loaded successfully');
    console.log('   Version:', mongoose.version);
} catch (error) {
    console.log('❌ Mongoose error:', error.message);
    process.exit(1);
}

// Test 3: Load Customer model
console.log('\n📝 TEST 3: Loading Customer model...');
let Customer;
try {
    Customer = require('./models/Customer');
    console.log('✅ Customer model loaded');
    console.log('   Model name:', Customer.modelName);
} catch (error) {
    console.log('❌ Failed to load Customer model:', error.message);
    console.log('   Stack:', error.stack);
    process.exit(1);
}

// Test 4: Check model schema
console.log('\n📋 TEST 4: Checking Customer schema...');
try {
    const schema = Customer.schema;
    console.log('✅ Schema loaded');
    console.log('   Fields:', Object.keys(schema.paths).join(', '));
    
    // Check pre-save hooks
    const preSaveHooks = schema.s.hooks._pres.get('save');
    console.log('   Pre-save hooks:', preSaveHooks ? preSaveHooks.length : 0);
    
    if (preSaveHooks && preSaveHooks.length > 0) {
        console.log('   ⚠️  WARNING: Multiple pre-save hooks detected!');
        console.log('   This might cause issues.');
    }
} catch (error) {
    console.log('❌ Schema check failed:', error.message);
}

// Test 5: Connect to MongoDB
const connectAndTest = async () => {
    console.log('\n🔌 TEST 5: Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }

    // Test 6: Clean test data
    console.log('\n🗑️  TEST 6: Cleaning test data...');
    try {
        await Customer.deleteMany({ customerId: { $in: ['TEST001', 'TEST002', 'TEST003'] } });
        console.log('✅ Test data cleaned');
    } catch (error) {
        console.log('❌ Cleanup failed:', error.message);
    }

    // Test 7: Create customer with direct bcrypt (bypassing middleware)
    console.log('\n🔐 TEST 7: Testing direct bcrypt...');
    try {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('TEST@123', salt);
        console.log('✅ Bcrypt works directly');
        console.log('   Hashed password length:', hashedPassword.length);
        
        // Verify the hash
        const isMatch = await bcrypt.compare('TEST@123', hashedPassword);
        console.log('   Password verification:', isMatch ? '✅ PASS' : '❌ FAIL');
    } catch (error) {
        console.log('❌ Direct bcrypt failed:', error.message);
        console.log('   Stack:', error.stack);
    }

    // Test 8: Create customer using .save() method
    console.log('\n💾 TEST 8: Testing Customer.save() method...');
    try {
        const testCustomer1 = new Customer({
            customerId: 'TEST001',
            name: 'Test User 1',
            email: 'test1@example.com',
            phone: '1234567890',
            password: 'TEST@123',
            status: 'active'
        });
        
        console.log('   Created customer instance');
        console.log('   About to call save()...');
        
        const savedCustomer1 = await testCustomer1.save();
        
        console.log('✅ Customer saved with .save() method');
        console.log('   ID:', savedCustomer1._id);
        console.log('   CustomerId:', savedCustomer1.customerId);
        
        // Check if password was hashed
        const customerWithPassword = await Customer.findById(savedCustomer1._id).select('+password');
        console.log('   Password hashed:', customerWithPassword.password.startsWith('$2') ? '✅ YES' : '❌ NO');
        
    } catch (error) {
        console.log('❌ .save() method failed:', error.message);
        console.log('   Error name:', error.name);
        console.log('   Stack:', error.stack);
        
        // This is the critical error
        if (error.message === 'next is not a function') {
            console.log('\n🔍 FOUND THE ERROR: "next is not a function"');
            console.log('   This occurs in the pre-save hook');
            console.log('   Problem is in models/Customer.js');
        }
    }

    // Test 9: Create customer using .create() method
    console.log('\n📝 TEST 9: Testing Customer.create() method...');
    try {
        const testCustomer2 = await Customer.create({
            customerId: 'TEST002',
            name: 'Test User 2',
            email: 'test2@example.com',
            phone: '0987654321',
            password: 'TEST@456',
            status: 'active'
        });
        
        console.log('✅ Customer created with .create() method');
        console.log('   ID:', testCustomer2._id);
        console.log('   CustomerId:', testCustomer2.customerId);
        
        // Check if password was hashed
        const customerWithPassword = await Customer.findById(testCustomer2._id).select('+password');
        console.log('   Password hashed:', customerWithPassword.password.startsWith('$2') ? '✅ YES' : '❌ NO');
        
    } catch (error) {
        console.log('❌ .create() method failed:', error.message);
        console.log('   Error name:', error.name);
        console.log('   Stack:', error.stack);
        
        if (error.message === 'next is not a function') {
            console.log('\n🔍 FOUND THE ERROR: "next is not a function"');
            console.log('   This occurs in the pre-save hook');
            console.log('   Problem is in models/Customer.js');
        }
    }

    // Test 10: Inspect the actual pre-save hook code
    console.log('\n🔬 TEST 10: Inspecting pre-save hook...');
    try {
        const schema = Customer.schema;
        const preSaveHooks = schema.s.hooks._pres.get('save');
        
        if (preSaveHooks && preSaveHooks.length > 0) {
            console.log('   Number of hooks:', preSaveHooks.length);
            preSaveHooks.forEach((hook, index) => {
                console.log(`   Hook ${index + 1}:`, hook.fn.toString().substring(0, 100) + '...');
            });
        }
    } catch (error) {
        console.log('❌ Could not inspect hooks:', error.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('DEBUG COMPLETE');
    console.log('='.repeat(60));
    
    await mongoose.connection.close();
    process.exit(0);
};

connectAndTest();