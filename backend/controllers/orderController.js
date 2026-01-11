const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Item = require('../models/Item');
const Proforma = require('../models/Proforma');
const Invoice = require('../models/Invoice');

// Helper function to transform order items to proforma/invoice format
const transformOrderItems = async (orderItems) => {
    const transformedItems = [];

    for (const item of orderItems) {
        let itemDetails = null;

        if (item.itemId && typeof item.itemId === 'object') {
            itemDetails = item.itemId;
        } else if (item.itemId) {
            itemDetails = await Item.findById(item.itemId);
        }

        const priceAfterDiscount =
            item.finalPrice ??
            (item.price * (1 - (item.discount || 0) / 100));

        transformedItems.push({
            itemId: item.itemId?._id || item.itemId,
            itemName: item.itemName || itemDetails?.name || 'Unknown Item',
            itemCode: itemDetails?.itemCode || '',
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0,
            subtotal: item.subtotal ?? (priceAfterDiscount * item.quantity)
        });
    }

    return transformedItems;
};


// Helper function to auto-generate proforma
const autoGenerateProforma = async (orderId) => {
    try {
        console.log('🔄 Attempting to auto-generate proforma for order:', orderId);

        const order = await Order.findById(orderId)
            .populate('customerId')
            .populate('items.itemId');

        if (!order) {
            console.log('⚠️ Order not found:', orderId);
            return null;
        }

        console.log('📋 Order details:', {
            orderNumber: order.orderNumber,
            customerId: order.customerId?._id,
            itemsCount: order.items?.length,
            totalAmount: order.totalAmount
        });

        // Check if proforma already exists
        const existing = await Proforma.findOne({ orderId });
        if (existing) {
            console.log('⚠️ Proforma already exists:', existing.proformaNumber);
            return existing;
        }

        // Transform order items to match proforma schema
        const proformaItems = await transformOrderItems(order.items);

        console.log('📝 Creating proforma with items:', proformaItems.length);

        // Create proforma
        const proforma = new Proforma({
            orderId: order._id,
            customerId: order.customerId._id,
            items: proformaItems,
            totalAmount: order.totalAmount,
            notes: order.notes || 'Auto-generated from order',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'pending'
        });

        await proforma.save();
        console.log('✅ Proforma auto-generated successfully:', proforma.proformaNumber);

        return proforma;

    } catch (error) {
        console.error('❌ Error auto-generating proforma:', error.message);
        console.error('Full error:', error);
        return null;
    }
};

// Helper function to auto-generate invoice
const autoGenerateInvoice = async (orderId) => {
    try {
        console.log('🔄 Attempting to auto-generate invoice for order:', orderId);

        const order = await Order.findById(orderId)
            .populate('customerId')
            .populate('items.itemId');

        if (!order) {
            console.log('⚠️ Order not found:', orderId);
            return null;
        }

        console.log('📋 Order details:', {
            orderNumber: order.orderNumber,
            customerId: order.customerId?._id,
            itemsCount: order.items?.length,
            totalAmount: order.totalAmount
        });

        // Check if invoice already exists
        const existing = await Invoice.findOne({ orderId });
        if (existing) {
            console.log('⚠️ Invoice already exists:', existing.invoiceNumber);
            return existing;
        }

        // Transform order items to match invoice schema
        const invoiceItems = await transformOrderItems(order.items);

        console.log('📝 Creating invoice with items:', invoiceItems.length);

        // Create invoice
        const invoice = new Invoice({
            orderId: order._id,
            customerId: order.customerId._id,
            items: invoiceItems,
            totalAmount: order.totalAmount,
            notes: order.notes || 'Auto-generated from order',
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
            paymentStatus: 'unpaid',
            paidAmount: 0
        });

        await invoice.save();
        console.log('✅ Invoice auto-generated successfully:', invoice.invoiceNumber);

        return invoice;

    } catch (error) {
        console.error('❌ Error auto-generating invoice:', error.message);
        console.error('Full error:', error);
        return null;
    }
};

// Create new order
exports.createOrder = async (req, res) => {
    try {
        console.log('🔍 createOrder called with body:', req.body);

        const { customerId, items, totalAmount, notes, autoGenerateDocs } = req.body;

        // Validation
        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Customer ID and items are required'
            });
        }

        // Verify customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Verify all items exist and enrich order items with item names
        const itemIds = items.map(item => item.itemId);
        const dbItems = await Item.find({ _id: { $in: itemIds } });

        if (dbItems.length !== itemIds.length) {
            return res.status(404).json({
                success: false,
                message: 'One or more items not found'
            });
        }

        // Prepare order items with full details
        const orderItems = items.map(item => {
            const dbItem = dbItems.find(i => i._id.toString() === item.itemId);

            // Calculate finalPrice based on the price and discount from the request
            const finalPrice = item.price * (1 - (item.discount || 0) / 100);

            return {
                itemId: item.itemId,
                itemName: dbItem.name,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount || 0,
                finalPrice: finalPrice,
                subtotal: finalPrice * item.quantity
            };
        });

        // Calculate total from items
        const calculatedTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

        // Create order
        const order = new Order({
            customerId,
            items: orderItems,
            totalAmount: totalAmount || calculatedTotal,
            notes: notes || '',
            status: 'pending'
        });

        await order.save();

        // Update customer orders count
        customer.orders = (customer.orders || 0) + 1;
        await customer.save();

        console.log('✅ Order created:', order.orderNumber);

        // Auto-generate proforma and invoice immediately after order creation
        // This happens regardless of status if autoGenerateDocs is true (default)
        if (autoGenerateDocs !== false) {
            console.log('📄 Auto-generating proforma for new order...');

            const proforma = await autoGenerateProforma(order._id);

            await order.populate('customerId', 'name email phone');
            await order.populate('items.itemId', 'itemCode itemCategory unit');

            return res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                data: {
                    order,
                    proforma: proforma ? {
                        id: proforma._id,
                        number: proforma.proformaNumber,
                        generated: true
                    } : { generated: false }
                }
            });
        }
        else {
            // Populate order with customer details
            await order.populate('customerId', 'name email phone');
            await order.populate('items.itemId', 'itemCode itemCategory unit');

            return res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                data: order
            });
        }

    } catch (error) {
        console.error('❌ Error creating order:', error);
        return res.status(500).json({
            success: false,
            message: 'Error placing order',
            error: error.message
        });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        console.log('🔍 getAllOrders called');

        const orders = await Order.find()
            .populate('customerId', 'name email phone')
            .populate('items.itemId', 'itemCode name')
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${orders.length} orders`);

        return res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Get orders by customer ID
exports.getOrdersByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        console.log('🔍 getOrdersByCustomer called for:', customerId);

        const orders = await Order.find({ customerId })
            .populate('items.itemId', 'itemCode name unit')
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${orders.length} orders for customer ${customerId}`);

        return res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('❌ Error fetching customer orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 getOrderById called:', id);

        const order = await Order.findById(id)
            .populate('customerId', 'name email phone customerId')
            .populate('items.itemId', 'itemCode name unit itemCategory');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('❌ Error fetching order:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, deliveryDate } = req.body;

        console.log('🔍 updateOrderStatus called for:', id, 'with status:', status);

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const oldStatus = order.status;
        console.log('📊 Old status:', oldStatus, '→ New status:', status);

        if (status) order.status = status;
        if (notes !== undefined) order.notes = notes;
        if (deliveryDate) order.deliveryDate = deliveryDate;

        await order.save();

        // Auto-generate proforma when status changes to processing or completed
        let proformaGenerated = false;
        let invoiceGenerated = false;

        if (status && oldStatus !== status) {

            // Generate proforma if missing
            if (status === 'processing') {
                const proforma = await autoGenerateProforma(order._id);
                if (proforma) proformaGenerated = true;

                const invoice = await autoGenerateInvoice(order._id);
                if (invoice) invoiceGenerated = true;
            }

            // Safety: ensure invoice exists on completed
            if (status === 'completed') {
                const invoice = await autoGenerateInvoice(order._id);
                if (invoice) invoiceGenerated = true;
            }
        }


        await order.populate('customerId', 'name email phone');
        await order.populate('items.itemId', 'itemCode name');

        console.log('✅ Order updated:', order.orderNumber);

        return res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: order,
            documentsGenerated: {
                proforma: proformaGenerated,
                invoice: invoiceGenerated
            }
        });

    } catch (error) {
        console.error('❌ Error updating order:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating order',
            error: error.message
        });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 deleteOrder called for:', id);

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        console.log('✅ Order deleted:', order.orderNumber);

        return res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting order:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: error.message
        });
    }
};

// Manual trigger endpoint to generate documents for existing orders
exports.generateDocumentsForOrder = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Manual document generation for order:', id);

        const proforma = await autoGenerateProforma(id);
        const invoice = await autoGenerateInvoice(id);

        return res.status(200).json({
            success: true,
            message: 'Documents generated',
            data: {
                proforma: proforma ? {
                    id: proforma._id,
                    number: proforma.proformaNumber
                } : null,
                invoice: invoice ? {
                    id: invoice._id,
                    number: invoice.invoiceNumber
                } : null
            }
        });

    } catch (error) {
        console.error('❌ Error generating documents:', error);
        return res.status(500).json({
            success: false,
            message: 'Error generating documents',
            error: error.message
        });
    }
};


// Add or update this function
exports.updateOrderItemDispatch = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { itemUpdates } = req.body; // Array of { itemIndex, dispatchQuantity }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update dispatch quantities
    itemUpdates.forEach(update => {
      if (order.items[update.itemIndex]) {
        order.items[update.itemIndex].dispatchQuantity = update.dispatchQuantity;
        // Recalculate subtotal based on dispatch quantity
        const item = order.items[update.itemIndex];
        const discountedPrice = item.price * (1 - item.discount / 100);
        item.subtotal = discountedPrice * update.dispatchQuantity;
      }
    });

    // Recalculate total amount
    order.totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Export helper functions
exports.autoGenerateProforma = autoGenerateProforma;
exports.autoGenerateInvoice = autoGenerateInvoice;