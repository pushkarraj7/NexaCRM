const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
    console.log(`🔍 Order Route Hit: ${req.method} ${req.path}`);
    next();
});

// All routes require authentication
router.use(protect);

// Create new order
router.post('/', orderController.createOrder);

// Get all orders
router.get('/', orderController.getAllOrders);

// Get orders by customer ID
router.get('/customer/:customerId', orderController.getOrdersByCustomer);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Update order status
router.put('/:id', orderController.updateOrderStatus);

// Delete order
router.delete('/:id', orderController.deleteOrder);

// Add this route for manual testing
router.post('/:id/generate-documents', orderController.generateDocumentsForOrder);

router.put('/:orderId/dispatch', orderController.updateOrderItemDispatch);

module.exports = router;