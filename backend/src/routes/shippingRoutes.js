// D:\stylescapes\backend\src\routes\shippingRoutes.js

const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Public route to get all shipping methods
// Endpoint: GET /api/shipping
router.get('/', shippingController.getShippingMethods);

// Admin-only route to create a new shipping method
// Endpoint: POST /api/shipping
// This route is protected by the verifyAdmin middleware.
router.post('/', verifyAdmin, shippingController.createShippingMethod);

// Admin-only route to update a shipping method
// Endpoint: PUT /api/shipping/:id
// This route is protected by the verifyAdmin middleware.
router.put('/:id', verifyAdmin, shippingController.updateShippingMethod);

module.exports = router;
