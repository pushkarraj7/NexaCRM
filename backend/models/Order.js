const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true
    },
    items: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true
        },
        itemName: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        dispatchQuantity: {
            type: Number,
            default: function () {
                return this.quantity; // Default to ordered quantity
            }
        },
        price: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        },
        finalPrice: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Generate order number before saving - FIXED VERSION
orderSchema.pre('save', async function () {
    if (this.isNew && !this.orderNumber) {
        // Get the count of existing orders
        const count = await this.constructor.countDocuments();
        // Generate order number with padding
        this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
    }
});

module.exports = mongoose.model('Order', orderSchema);