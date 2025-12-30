const express = require('express');
const router = express.Router();
const { 
    register, 
    registerCustomer,
    login, 
    customerLogin,
    getProfile, 
    getCustomerProfile,
    getCustomers, 
    updateCustomer, 
    deleteCustomer 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// User routes (Admin/Finance)
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

// Customer routes
router.post('/register-customer', protect, authorize('admin'), registerCustomer);
router.post('/customer-login', customerLogin);
router.get('/customer-profile', protect, getCustomerProfile);
router.get('/customers', protect, authorize('admin'), getCustomers);
router.put('/customers/:id', protect, authorize('admin'), updateCustomer);
router.delete('/customers/:id', protect, authorize('admin'), deleteCustomer);

module.exports = router;