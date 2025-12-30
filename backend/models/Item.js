const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: [true, 'Please provide item code'],
      trim: true,
      unique: true,
    },
    itemCategory: {
      type: String,
      required: [true, 'Please provide item category'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Please provide unit'],
      enum: ['kg', 'g', 'ltr', 'ml', 'pcs', 'box', 'packet'],
      default: 'kg',
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    mrp: {
      type: Number,
      required: [true, 'Please provide MRP'],
      min: [0, 'MRP cannot be negative'],
    },
    hsnCode: {
      type: String,
      required: [true, 'Please provide HSN code'],
      trim: true,
    },
    tax: {
      type: Number,
      required: [true, 'Please provide tax percentage'],
      min: [0, 'Tax cannot be negative'],
      max: [100, 'Tax cannot exceed 100%'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);