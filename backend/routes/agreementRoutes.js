// routes/agreementRoutes.js
const express = require('express');
const router = express.Router();
const customerItemController = require('../controllers/customerItemController');
const { protect } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
    console.log(`🔍 Agreement Route Hit: ${req.method} ${req.path}`);
    next();
});

router.use(protect);

// Get all agreements
router.get('/', customerItemController.getAllAgreements);

// Get agreement by ID
router.get('/:id', customerItemController.getAgreementById);

// Create new agreement
router.post('/', customerItemController.createAgreement);

// Update agreement
router.put('/:id', customerItemController.updateAgreement);

// Delete agreement
router.delete('/:id', customerItemController.deleteAgreement);

module.exports = router;