// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoiceById,
  updatePaymentStatus,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

// Protect routes with your auth middleware
// const { protect } = require('../middleware/authMiddleware');
// router.use(protect);

// Get all invoices
router.get('/', getAllInvoices);

// Get single invoice
router.get('/:id', getInvoiceById);

// Update payment status
router.put('/:id/payment', updatePaymentStatus);

// Update invoice
router.put('/:id', updateInvoice);

// Delete invoice
router.delete('/:id', deleteInvoice);

module.exports = router;