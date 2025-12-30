// models/Proforma.js
const mongoose = require('mongoose');

const proformaItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  itemName: {
    type: String,
    required: true
  },
  itemCode: String,
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const proformaSchema = new mongoose.Schema({
  proformaNumber: {
    type: String,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [proformaItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'converted', 'cancelled', 'expired'],
    default: 'pending'
  },
  generatedDate: {
    type: Date,
    default: Date.now
  },
  convertedToInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  convertedDate: Date,
  notes: String,
  validUntil: Date
}, {
  timestamps: true
});

// Auto-generate proforma number
proformaSchema.pre('save', async function () {
  if (this.proformaNumber) return; // Already set, skip

  const year = new Date().getFullYear();

  // Find last proforma for this year
  const lastProforma = await mongoose.model('Proforma')
    .findOne({ proformaNumber: new RegExp(`^PI-${year}-`) })
    .sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastProforma) {
    const lastSeq = parseInt(lastProforma.proformaNumber.split('-')[2], 10);
    nextNumber = lastSeq + 1;
  }

  this.proformaNumber = `PI-${year}-${String(nextNumber).padStart(4, '0')}`;
});


module.exports = mongoose.model('Proforma', proformaSchema);