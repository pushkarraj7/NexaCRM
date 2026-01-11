const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const agreementRoutes = require('./routes/agreementRoutes');
const customerItemRoutes = require('./routes/customerItemRoutes');
const customerRoutes = require('./routes/customerRoutes');  // ✅ NEW
const orderRoutes = require('./routes/orderRoutes');
const proformaRoutes = require('./routes/proformaRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// app.use(cors());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://yourdomain.com',           // Replace with your actual domain
    'https://www.yourdomain.com',       // Replace with your actual domain
    'https://nexacrm-frontend.onrender.com',  // If you use Render for frontend
    'https://nexacrm-frontend.vercel.app'     // If you use Vercel for frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/agreements', agreementRoutes);              // Admin: manage all agreements
app.use('/api/customer-items', customerItemRoutes);       // Admin: manage customer items
app.use('/api/customers', customerRoutes);                // ✅ NEW: Customer portal
app.use('/api/orders', orderRoutes);
app.use('/api/proforma', proformaRoutes);
app.use('/api/invoices', invoiceRoutes);

console.log('✅ Agreement routes registered at /api/agreements (ADMIN)');
console.log('✅ Customer-item routes registered at /api/customer-items (ADMIN)');
console.log('✅ Customer routes registered at /api/customers (CUSTOMER)');  // ✅ NEW
console.log('✅ Order routes registered at /api/orders');

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'API is running...',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      // Admin endpoints
      agreements: '/api/agreements',
      customerItems: '/api/customer-items',
      // Customer endpoints
      customers: '/api/customers',  // ✅ NEW
      orders: '/api/orders'
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Route not found',
    attempted: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/api/auth/*',
      '/api/items/*',
      '/api/agreements/* (ADMIN)',
      '/api/customer-items/* (ADMIN)',
      '/api/customers/* (CUSTOMER)',  // ✅ NEW
      '/api/orders/*',
      '/api/proforma/*',     // ✅ ADD
      '/api/invoices/*'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});