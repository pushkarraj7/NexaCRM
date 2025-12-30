const express = require('express');
const router = express.Router();
const customerItemController = require('../controllers/customerItemController');
const { protect } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
    console.log(`🔍 CustomerItem Route Hit: ${req.method} ${req.path}`);
    next();
});

// All routes require authentication
router.use(protect);

// MOST SPECIFIC ROUTES FIRST (order matters!)

// Get items for a specific customer (this was duplicated and needs to be first)
router.get('/customer/:customerId/items', customerItemController.getCustomerItems);

// Get all agreements
router.get('/', customerItemController.getAllAgreements);

// Get agreement by ID (this should be AFTER more specific routes)
router.get('/:id', customerItemController.getAgreementById);

// Create new agreement
router.post('/', customerItemController.createAgreement);

// Update agreement
router.put('/:id', customerItemController.updateAgreement);

// Delete agreement
router.delete('/:id', customerItemController.deleteAgreement);

module.exports = router;