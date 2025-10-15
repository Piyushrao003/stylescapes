// D:\stylescapes\backend\server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const handleErrors = require('./src/middleware/errorHandler');

// Existing Routes
const authRoutes = require('./src/routes/authRoutes');
const productsRoutes = require('./src/routes/productRoutes');
const ordersRoutes = require('./src/routes/orderRoutes');
const couponsRoutes = require('./src/routes/couponRoutes');
const shippingRoutes = require('./src/routes/shippingRoutes');
const reviewsRoutes = require('./src/routes/reviewRoutes');
const transactionsRoutes = require('./src/routes/transactionRoutes');

// EXISTING POLICY ROUTE IMPORT
const policiesRoutes = require('./src/routes/policiesRoutes'); 

// NEW USER ROUTE IMPORT (Fix for Wishlist 404)
const userRoutes = require('./src/routes/userRoutes'); // <-- New Import

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/transactions', transactionsRoutes);

// POLICY ROUTE MOUNT
app.use('/api/policies', policiesRoutes);

// NEW USER ROUTE MOUNT (Fix for Wishlist 404)
app.use('/api/user', userRoutes); // <-- All User data endpoints are now active here

// Error handling middleware
app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});