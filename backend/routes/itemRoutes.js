const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (or protected based on your needs)
router.get('/', protect, getItems);
router.get('/:id', protect, getItemById);

// Admin only routes
router.post('/', protect, authorize('admin'), createItem);
router.put('/:id', protect, authorize('admin'), updateItem);
router.delete('/:id', protect, authorize('admin'), deleteItem);

module.exports = router;