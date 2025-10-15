// D:\stylescapes\backend\src\routes\couponsRoutes.js

const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Admin-only route to get all coupons
// Endpoint: GET /api/coupons
// This route is protected by the verifyAdmin middleware.
router.get('/', verifyAdmin, couponController.getCoupons);

// Admin-only route to create a new coupon
// Endpoint: POST /api/coupons
// This route is protected by the verifyAdmin middleware.
router.post('/', verifyAdmin, couponController.createCoupon);

// Admin-only route to update a coupon
// Endpoint: PUT /api/coupons/:id
// This route is protected by the verifyAdmin middleware.
router.put('/:id', verifyAdmin, couponController.updateCoupon);

// Admin-only route to delete a coupon
// Endpoint: DELETE /api/coupons/:id
// This route is protected by the verifyAdmin middleware.
router.delete('/:id', verifyAdmin, couponController.deleteCoupon);

module.exports = router;
