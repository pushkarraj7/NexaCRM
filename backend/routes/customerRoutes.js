// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
    console.log(`🔍 Customer Route Hit: ${req.method} ${req.path}`);
    next();
});

// All routes require authentication
router.use(protect);

// Customer gets their own items
router.get('/my-items', customerController.getMyItems);

// Customer gets their own profile
router.get('/me', customerController.getMyProfile);

module.exports = router;