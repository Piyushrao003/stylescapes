// D:\stylescapes\backend\src\routes\userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyUser, verifyAdmin } = require('../middleware/authMiddleware'); 

// ----------------------------------------------------
// CORE PROFILE ROUTES
// ----------------------------------------------------

// 1. GET /api/user/profile (Fetch profile)
router.get('/profile', verifyUser, userController.getUserProfile);

// 2. PUT /api/user/profile (Update profile)
router.put('/profile', verifyUser, userController.updateUserProfile); 

// ----------------------------------------------------
// ADDRESS MANAGEMENT ENDPOINTS
// ----------------------------------------------------

// 3. POST /api/user/addresses - Add a new address (Protected)
router.post('/addresses', verifyUser, userController.addAddress);

// 4. PUT /api/user/addresses/:addressId - Update an address or sets it as default (Protected)
router.put('/addresses/:addressId', verifyUser, userController.updateAddress);

// 5. DELETE /api/user/addresses/:addressId - Deletes a user address.
router.delete('/addresses/:addressId', verifyUser, userController.deleteAddress);

// ----------------------------------------------------
// WISHLIST & VERIFICATION
// ----------------------------------------------------

// 6. PUT /api/user/wishlist 
router.put('/wishlist', verifyUser, userController.updateUserWishlist);

// 7. GET /api/user/verify-purchase/:productId
router.get('/verify-purchase/:productId', verifyUser, userController.getVerificationStatus);

// ----------------------------------------------------
// CART ENDPOINTS
// ----------------------------------------------------

// 8. GET /api/user/cart 
router.get('/cart', verifyUser, userController.getCartItems);

// 9. GET /api/user/cart/:uid (Admin access)
router.get('/cart/:uid', verifyAdmin, userController.getCartItems);

// 10. POST /api/user/cart 
router.post('/cart', verifyUser, userController.updateCart);

// 11. DELETE /api/user/cart/:itemId 
router.delete('/cart/:itemId', verifyUser, userController.removeCartItem);

// 12. DELETE /api/user/cart/clear
router.delete('/cart/clear', verifyUser, userController.clearCart);

// ----------------------------------------------------
// REPORTING ENDPOINTS
// ----------------------------------------------------

// 13. POST /api/user/submit-ticket 
router.post('/submit-ticket', verifyUser, userController.submitSupportTicket);

// 14. GET /api/user/admin/reports 
router.get('/admin/reports', verifyAdmin, userController.getAdminReports);

// ----------------------------------------------------
// NEW: ADMIN USER MANAGEMENT ENDPOINTS
// ----------------------------------------------------

// 15. GET /api/user/users - Admin route to fetch all users (for UserDashboard)
router.get('/users', 
    verifyAdmin, 
    userController.getAllUsers 
);

// 16. PUT /api/user/users/:userId/status - Admin route to update block/active status
router.put('/:userId/status', 
    verifyAdmin, 
    userController.updateUserStatus 
);

// ----------------------------------------------------
// NEW: ACTIVITY/PRESENCE ENDPOINTS
// ----------------------------------------------------

// 17. PUT /api/user/status/online - Protected route to update online status (for Total Online Time tracking)
router.put('/status/online', 
    verifyUser, 
    userController.updateUserOnlineStatus 
);

module.exports = router;