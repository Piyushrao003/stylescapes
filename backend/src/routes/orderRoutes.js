// D:\stylescapes\backend\src\routes\ordersRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyUser, verifyAdmin } = require('../middleware/authMiddleware');

// Admin-only route to get all orders
// Endpoint: GET /api/orders
// This route is protected by the verifyAdmin middleware.
router.get('/', verifyAdmin, orderController.getOrders);

// User-specific route to get their own orders
// Endpoint: GET /api/orders/user
// This route is protected by the verifyUser middleware.
router.get('/user', verifyUser, orderController.getOrdersByUserId);

// User-specific route to create a new order
// Endpoint: POST /api/orders
// This route is protected by the verifyUser middleware.
router.post('/', verifyUser, orderController.createOrder);

// Admin-only route to update an order's status
// Endpoint: PUT /api/orders/:id/status
// This route is protected by the verifyAdmin middleware.
router.put('/:id/status', verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
