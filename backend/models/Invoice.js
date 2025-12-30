// models/Invoice.js
const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
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

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },
  proformaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proforma',
    required: true,
    index: true
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
  items: [invoiceItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  paymentMethod: String,
  notes: String
}, {
  timestamps: true
});

// Auto-generate invoice number
// Auto-generate invoice number (without next())
invoiceSchema.pre('save', async function () {
  if (this.invoiceNumber) return; // Already set, skip

  const year = new Date().getFullYear();

  // Find last invoice for this year
  const lastInvoice = await mongoose.model('Invoice')
    .findOne({ invoiceNumber: new RegExp(`^INV-${year}-`) })
    .sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
    nextNumber = lastSeq + 1;
  }

  this.invoiceNumber = `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
});


module.exports = mongoose.model('Invoice', invoiceSchema);