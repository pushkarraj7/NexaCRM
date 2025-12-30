const CustomerItem = require('../models/CustomerItem');
const Customer = require('../models/Customer');
const Item = require('../models/Item');

// Get all customer-item agreements
// controllers/customerItemController.js

// Get all customer-item agreements
exports.getAllAgreements = async (req, res) => {
    try {
        console.log('🔍 getAllAgreements called');

        const agreements = await CustomerItem.find()
            .populate('customerId', 'name email phone')
            .populate('items.itemId', 'name category')  // ✅ This populates itemId inside items array
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${agreements.length} agreements`);
        console.log('Sample agreement:', JSON.stringify(agreements[0], null, 2));  // 🔍 Debug

        return res.json(agreements);  // ✅ Returns array directly
    } catch (error) {
        console.error('❌ Error fetching agreements:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get agreement by ID
exports.getAgreementById = async (req, res) => {
    try {
        console.log('🔍 getAgreementById called:', req.params.id);

        const agreement = await CustomerItem.findById(req.params.id)
            .populate('customerId', 'name email phone')  // added phone
            .populate('itemId', 'name category');

        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found' });
        }

        return res.json(agreement);
    } catch (error) {
        console.error('❌ Error fetching agreement:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get items for a specific customer
exports.getCustomerItems = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Find customer items agreement
        const customerItems = await CustomerItem.findOne({ customerId });

        if (!customerItems || !customerItems.items || customerItems.items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No items found for this customer'
            });
        }

        // Extract item IDs from customer items
        const itemIds = customerItems.items.map(item => item.itemId);

        // Fetch full item details from items table
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
                // Customer-specific pricing from customeritems table
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
            message: 'Error fetching customer items',
            error: error.message
        });
    }
};

// Create new agreement
exports.createAgreement = async (req, res) => {
    try {
        console.log('🔍 createAgreement called with body:', req.body);

        const { customerId, items } = req.body;

        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Customer and Items array are required'
            });
        }

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Validate all items exist
        const itemIds = items.map(i => i.itemId);
        const itemsExist = await Item.find({ _id: { $in: itemIds } });
        if (itemsExist.length !== itemIds.length) {
            return res.status(404).json({ message: 'One or more items not found' });
        }

        // Check if agreement already exists for this customer
        let agreement = await CustomerItem.findOne({ customerId });

        if (agreement) {
            // Add new items to existing agreement, avoiding duplicates
            const existingItemIds = agreement.items.map(i => i.itemId.toString());
            const newItems = items.filter(item => !existingItemIds.includes(item.itemId));

            if (newItems.length > 0) {
                agreement.items.push(...newItems);
                await agreement.save();
            }

            await agreement.populate('customerId', 'name email phone');  // added phone
            await agreement.populate('items.itemId', 'name category');

            return res.status(200).json({
                message: `Added ${newItems.length} new item(s)`,
                agreement
            });
        } else {
            // Create new agreement
            agreement = new CustomerItem({
                customerId,
                items: items.map(item => ({
                    itemId: item.itemId,
                    price: parseFloat(item.price),
                    discount: item.discount ? parseFloat(item.discount) : 0
                }))
            });

            await agreement.save();
            await agreement.populate('customerId', 'name email phone');  // added phone
            await agreement.populate('items.itemId', 'name category');

            console.log('✅ Agreement created:', agreement._id);
            return res.status(201).json({
                message: 'Agreement created successfully',
                agreement
            });
        }
    } catch (error) {
        console.error('❌ Error creating agreement:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update agreement
exports.updateAgreement = async (req, res) => {
    try {
        const { id } = req.params;
        const { customerId, items } = req.body;

        console.log('🔍 updateAgreement called for:', id);

        const agreement = await CustomerItem.findById(id);
        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found' });
        }

        if (customerId) agreement.customerId = customerId;
        if (items && Array.isArray(items)) {
            agreement.items = items.map(item => ({
                itemId: item.itemId,
                price: parseFloat(item.price),
                discount: item.discount ? parseFloat(item.discount) : 0
            }));
        }

        await agreement.save();
        await agreement.populate('customerId', 'name email');
        await agreement.populate('items.itemId', 'name category');

        console.log('✅ Agreement updated:', agreement._id);
        return res.json(agreement);
    } catch (error) {
        console.error('❌ Error updating agreement:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete agreement
exports.deleteAgreement = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 deleteAgreement called for:', id);

        const agreement = await CustomerItem.findByIdAndDelete(id);

        if (!agreement) {
            return res.status(404).json({ message: 'Agreement not found' });
        }

        console.log('✅ Agreement deleted:', id);
        return res.json({ message: 'Agreement deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting agreement:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};