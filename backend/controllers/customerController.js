// controllers/customerController.js
const CustomerItem = require('../models/CustomerItem');
const Item = require('../models/Item');

// Get items for logged-in customer
exports.getMyItems = async (req, res) => {
    try {
        // req.user comes from protect middleware
        const customerId = req.user._id;

        console.log('🔍 Customer fetching their items:', customerId);

        // Find customer items agreement
        const customerItems = await CustomerItem.findOne({ customerId });

        if (!customerItems || !customerItems.items || customerItems.items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No items found for your account'
            });
        }

        // Extract item IDs
        const itemIds = customerItems.items.map(item => item.itemId);

        // Fetch full item details
        const items = await Item.find({
            _id: { $in: itemIds },
            status: 'active'
        });

        // Merge item details with customer-specific pricing
        const enrichedItems = items.map(item => {
            const customerItem = customerItems.items.find(
                ci => ci.itemId.toString() === item._id.toString()
            );

            return {
                _id: item._id,
                itemCode: item.itemCode,
                name: item.name,
                category: item.itemCategory,
                unit: item.unit,
                description: item.description || '',
                image: item.image || null,
                hsnCode: item.hsnCode,
                tax: item.tax,
                price: customerItem.price,
                discount: customerItem.discount,
                finalPrice: customerItem.price - (customerItem.price * customerItem.discount / 100)
            };
        });

        res.status(200).json({
            success: true,
            data: enrichedItems
        });

    } catch (error) {
        console.error('Error fetching customer items:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your items',
            error: error.message
        });
    }
};

// Get customer's own profile
exports.getMyProfile = async (req, res) => {
    try {
        const customerId = req.user._id;
        
        const customer = await Customer.findById(customerId).select('-password');
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};