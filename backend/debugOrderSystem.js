// debugOrderSystem.js
// Run this with: node debugOrderSystem.js

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Proforma = require('./models/Proforma');
const Invoice = require('./models/Invoice');
const Customer = require('./models/Customer');
const Item = require('./models/Item');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!mongoUri) {
            console.error('❌ MongoDB URI not found in .env file');
            console.log('Please check your .env file has either MONGODB_URI or MONGO_URI');
            process.exit(1);
        }
        
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Connected');
        console.log('   Database:', mongoose.connection.name);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Debug Step 1: Check if models are working
const debugModels = async () => {
    console.log('\n========== STEP 1: Testing Models ==========');
    
    try {
        const orderCount = await Order.countDocuments();
        const proformaCount = await Proforma.countDocuments();
        const invoiceCount = await Invoice.countDocuments();
        const customerCount = await Customer.countDocuments();
        const itemCount = await Item.countDocuments();
        
        console.log('📊 Database Counts:');
        console.log('   Orders:', orderCount);
        console.log('   Proformas:', proformaCount);
        console.log('   Invoices:', invoiceCount);
        console.log('   Customers:', customerCount);
        console.log('   Items:', itemCount);
        
        return true;
    } catch (error) {
        console.error('❌ Error checking models:', error.message);
        return false;
    }
};

// Debug Step 2: Check existing orders
const debugExistingOrders = async () => {
    console.log('\n========== STEP 2: Checking Existing Orders ==========');
    
    try {
        const orders = await Order.find().limit(5);
        
        if (orders.length === 0) {
            console.log('⚠️ No orders found in database');
            return [];
        }
        
        console.log(`📋 Found ${orders.length} orders (showing first 5):\n`);
        
        orders.forEach((order, index) => {
            console.log(`Order ${index + 1}:`);
            console.log('   ID:', order._id);
            console.log('   Order Number:', order.orderNumber || 'N/A');
            console.log('   Customer ID:', order.customerId);
            console.log('   Status:', order.status);
            console.log('   Items Count:', order.items?.length || 0);
            console.log('   Total Amount:', order.totalAmount);
            console.log('   Created:', order.createdAt);
            console.log('');
        });
        
        return orders;
    } catch (error) {
        console.error('❌ Error fetching orders:', error.message);
        return [];
    }
};

// Debug Step 3: Check if proformas/invoices exist for orders
const debugOrderDocuments = async () => {
    console.log('\n========== STEP 3: Checking Order Documents ==========');
    
    try {
        const orders = await Order.find().limit(10);
        
        for (const order of orders) {
            const proforma = await Proforma.findOne({ orderId: order._id });
            const invoice = await Invoice.findOne({ orderId: order._id });
            
            console.log(`\nOrder: ${order.orderNumber || order._id}`);
            console.log('   Status:', order.status);
            console.log('   Has Proforma:', proforma ? `✅ ${proforma.proformaNumber}` : '❌ No');
            console.log('   Has Invoice:', invoice ? `✅ ${invoice.invoiceNumber}` : '❌ No');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error checking documents:', error.message);
        return false;
    }
};

// Debug Step 4: Test creating a proforma manually
const debugCreateProforma = async (orderId) => {
    console.log('\n========== STEP 4: Testing Proforma Creation ==========');
    console.log('Order ID:', orderId);
    
    try {
        // Fetch the order
        console.log('\n1️⃣ Fetching order...');
        const order = await Order.findById(orderId)
            .populate('customerId')
            .populate('items.itemId');
        
        if (!order) {
            console.error('❌ Order not found!');
            return null;
        }
        
        console.log('✅ Order found:', order.orderNumber || order._id);
        console.log('   Customer:', order.customerId?.name || order.customerId);
        console.log('   Items:', order.items?.length);
        console.log('   Total:', order.totalAmount);
        
        // Check if proforma exists
        console.log('\n2️⃣ Checking if proforma already exists...');
        const existing = await Proforma.findOne({ orderId: order._id });
        
        if (existing) {
            console.log('⚠️ Proforma already exists:', existing.proformaNumber);
            return existing;
        }
        
        console.log('✅ No existing proforma found');
        
        // Transform items
        console.log('\n3️⃣ Transforming order items...');
        const proformaItems = [];
        
        for (const item of order.items) {
            let itemDetails = null;
            
            if (item.itemId && typeof item.itemId === 'object') {
                itemDetails = item.itemId;
            } else if (item.itemId) {
                itemDetails = await Item.findById(item.itemId);
            }
            
            const transformedItem = {
                itemId: item.itemId?._id || item.itemId,
                itemName: item.itemName || itemDetails?.name || 'Unknown Item',
                itemCode: itemDetails?.itemCode || '',
                quantity: item.quantity,
                price: item.price,
                discount: item.discount || 0,
                subtotal: item.subtotal || (item.finalPrice * item.quantity) || (item.price * item.quantity)
            };
            
            console.log('   Item:', transformedItem.itemName);
            console.log('      Code:', transformedItem.itemCode);
            console.log('      Qty:', transformedItem.quantity);
            console.log('      Price:', transformedItem.price);
            console.log('      Subtotal:', transformedItem.subtotal);
            
            proformaItems.push(transformedItem);
        }
        
        console.log(`✅ Transformed ${proformaItems.length} items`);
        
        // Create proforma
        console.log('\n4️⃣ Creating proforma...');
        
        const proformaData = {
            orderId: order._id,
            customerId: order.customerId._id || order.customerId,
            items: proformaItems,
            totalAmount: order.totalAmount,
            notes: order.notes || 'Auto-generated from order',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'pending'
        };
        
        console.log('Proforma data:', JSON.stringify(proformaData, null, 2));
        
        const proforma = new Proforma(proformaData);
        await proforma.save();
        
        console.log('✅ Proforma created successfully!');
        console.log('   Number:', proforma.proformaNumber);
        console.log('   ID:', proforma._id);
        
        return proforma;
        
    } catch (error) {
        console.error('❌ Error creating proforma:', error.message);
        console.error('Full error:', error);
        return null;
    }
};

// Debug Step 5: Test creating an invoice manually
const debugCreateInvoice = async (orderId) => {
    console.log('\n========== STEP 5: Testing Invoice Creation ==========');
    console.log('Order ID:', orderId);
    
    try {
        // Fetch the order
        console.log('\n1️⃣ Fetching order...');
        const order = await Order.findById(orderId)
            .populate('customerId')
            .populate('items.itemId');
        
        if (!order) {
            console.error('❌ Order not found!');
            return null;
        }
        
        console.log('✅ Order found:', order.orderNumber || order._id);
        
        // Check if invoice exists
        console.log('\n2️⃣ Checking if invoice already exists...');
        const existing = await Invoice.findOne({ orderId: order._id });
        
        if (existing) {
            console.log('⚠️ Invoice already exists:', existing.invoiceNumber);
            return existing;
        }
        
        console.log('✅ No existing invoice found');
        
        // Transform items
        console.log('\n3️⃣ Transforming order items...');
        const invoiceItems = [];
        
        for (const item of order.items) {
            let itemDetails = null;
            
            if (item.itemId && typeof item.itemId === 'object') {
                itemDetails = item.itemId;
            } else if (item.itemId) {
                itemDetails = await Item.findById(item.itemId);
            }
            
            const transformedItem = {
                itemId: item.itemId?._id || item.itemId,
                itemName: item.itemName || itemDetails?.name || 'Unknown Item',
                itemCode: itemDetails?.itemCode || '',
                quantity: item.quantity,
                price: item.price,
                discount: item.discount || 0,
                subtotal: item.subtotal || (item.finalPrice * item.quantity) || (item.price * item.quantity)
            };
            
            invoiceItems.push(transformedItem);
        }
        
        console.log(`✅ Transformed ${invoiceItems.length} items`);
        
        // Create invoice
        console.log('\n4️⃣ Creating invoice...');
        
        const invoiceData = {
            orderId: order._id,
            customerId: order.customerId._id || order.customerId,
            items: invoiceItems,
            totalAmount: order.totalAmount,
            notes: order.notes || 'Auto-generated from order',
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            paymentStatus: 'unpaid',
            paidAmount: 0
        };
        
        console.log('Invoice data:', JSON.stringify(invoiceData, null, 2));
        
        const invoice = new Invoice(invoiceData);
        await invoice.save();
        
        console.log('✅ Invoice created successfully!');
        console.log('   Number:', invoice.invoiceNumber);
        console.log('   ID:', invoice._id);
        
        return invoice;
        
    } catch (error) {
        console.error('❌ Error creating invoice:', error.message);
        console.error('Full error:', error);
        return null;
    }
};

// Generate documents for all pending orders
const generateForAllPendingOrders = async () => {
    console.log('\n========== Generating Documents for All Pending Orders ==========');
    
    try {
        const pendingOrders = await Order.find({ status: 'pending' });
        
        console.log(`📋 Found ${pendingOrders.length} pending orders\n`);
        
        for (const order of pendingOrders) {
            console.log(`\n🔄 Processing Order: ${order.orderNumber || order._id}`);
            
            const proforma = await debugCreateProforma(order._id);
            const invoice = await debugCreateInvoice(order._id);
            
            console.log('Results:');
            console.log('   Proforma:', proforma ? '✅ Created' : '❌ Failed');
            console.log('   Invoice:', invoice ? '✅ Created' : '❌ Failed');
        }
        
        console.log('\n✅ Finished processing all pending orders');
        
    } catch (error) {
        console.error('❌ Error processing pending orders:', error.message);
    }
};

// Main debug function
const runDebug = async () => {
    console.log('🔍 Starting Order System Debug...\n');
    
    await connectDB();
    
    // Run all debug steps
    await debugModels();
    const orders = await debugExistingOrders();
    await debugOrderDocuments();
    
    // If there are orders, test with the first one
    if (orders.length > 0) {
        const testOrderId = orders[0]._id;
        console.log(`\n🧪 Testing with Order ID: ${testOrderId}`);
        
        await debugCreateProforma(testOrderId);
        await debugCreateInvoice(testOrderId);
    }
    
    // Ask if user wants to generate for all pending orders
    console.log('\n' + '='.repeat(60));
    console.log('Would you like to generate documents for ALL pending orders?');
    console.log('Uncomment the line below and run again:');
    console.log('// await generateForAllPendingOrders();');
    console.log('='.repeat(60));
    
    // Uncomment this line to generate for all pending orders:
    // await generateForAllPendingOrders();
    
    await mongoose.connection.close();
    console.log('\n✅ Debug completed. Database connection closed.');
};

// Run the debug
runDebug();