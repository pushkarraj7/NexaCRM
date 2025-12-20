const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Agreement = require('../models/Agreement');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

// Sample agreements data
const agreements = [
  {
    agreementId: 'AGR-001', // Add this
    party: 'ABC Dairy',
    type: 'Supply',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    amount: '₹5,00,000',
    status: 'active',
  },
  {
    agreementId: 'AGR-002', // Add this
    party: 'XYZ Milk',
    type: 'Purchase',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-05-31'),
    amount: '₹3,20,000',
    status: 'expired',
  },
  {
    agreementId: 'AGR-003', // Add this
    party: 'Green Farms Ltd',
    type: 'Supply',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2025-03-14'),
    amount: '₹7,50,000',
    status: 'active',
  },
  {
    agreementId: 'AGR-004', // Add this
    party: 'Fresh Dairy Co.',
    type: 'Distribution',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2025-05-31'),
    amount: '₹4,80,000',
    status: 'active',
  },
  {
    agreementId: 'AGR-005', // Add this
    party: 'Organic Milk Hub',
    type: 'Purchase',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31'),
    amount: '₹2,50,000',
    status: 'expired',
  },
];

// Connect to DB
connectDB();

// Import data
const importData = async () => {
  try {
    // Clear existing agreements
    await Agreement.deleteMany();
    console.log('Existing agreements deleted');

    // Insert new agreements
    await Agreement.insertMany(agreements);
    console.log('Sample agreements imported successfully');

    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Agreement.deleteMany();
    console.log('All agreements deleted successfully');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use: node seedAgreements.js -i (import) or -d (delete)');
  process.exit();
}