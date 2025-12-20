const express = require('express');
const router = express.Router();
const {
  getAgreements,
  getAgreement,
  createAgreement,
  updateAgreement,
  deleteAgreement,
  getAgreementsByStatus,
  updateAgreementStatus,
} = require('../controllers/agreementController');
const { protect } = require('../middleware/auth');

// Apply authentication middleware to all routes
// If you want public access, remove protect middleware

// Main CRUD routes
router.route('/')
  .get(protect, getAgreements)
  .post(protect, createAgreement);

router.route('/:id')
  .get(protect, getAgreement)
  .put(protect, updateAgreement)
  .delete(protect, deleteAgreement);

// Status-specific routes
router.get('/status/:status', protect, getAgreementsByStatus);
router.patch('/:id/status', protect, updateAgreementStatus);

module.exports = router;