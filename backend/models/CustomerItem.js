const mongoose = require('mongoose');

const customerItemSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        unique: true  // One document per customer
    },
    items: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    }]
}, {
    timestamps: true
});

// Remove the old compound index
// customerItemSchema.index({ customerId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('CustomerItem', customerItemSchema);