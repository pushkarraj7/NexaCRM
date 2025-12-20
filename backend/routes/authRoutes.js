// const express = require('express');
// const router = express.Router();
// const { register, login, getProfile } = require('../controllers/authController');
// const { protect } = require('../middleware/auth');

// router.post('/register', register);
// router.post('/login', login);
// router.get('/profile', protect, getProfile);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { register, login, getProfile, getCustomers, updateCustomer, deleteCustomer } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/customers', protect, authorize('admin'), getCustomers);
router.put('/customers/:id', protect, authorize('admin'), updateCustomer);
router.delete('/customers/:id', protect, authorize('admin'), deleteCustomer);

module.exports = router;