// routes/proformaRoutes.js
const express = require('express');
const router = express.Router();

const {
  generateProforma,
  getAllProformas,
  getProformaById,
  convertProformaToInvoice,   // ✅ IMPORT THIS
  updateProformaStatus,
  deleteProforma
} = require('../controllers/proformaController');

// Generate proforma from order
router.post('/generate/:orderId', generateProforma);

// Get all proformas
router.get('/', getAllProformas);

// Get single proforma
router.get('/:id', getProformaById);

// ✅ Convert Proforma → Sale Invoice (USER ACTION)
router.post('/:id/convert-to-invoice', convertProformaToInvoice);

// Update proforma status
router.put('/:id/status', updateProformaStatus);

// Cancel/Delete proforma
router.delete('/:id', deleteProforma);

module.exports = router;
