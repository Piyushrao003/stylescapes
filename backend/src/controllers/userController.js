// D:\stylescapes\backend\src\controllers\userController.js

const userService = require('../services/userService');
const { db } = require('../config/firebase'); 
const productService = require('../services/productService'); 
const reportService = require('../services/reportService'); 

// Helper function to calculate cart totals and structure the response
const processCartResponse = (cartItems) => {
    const calculatedItems = cartItems.map(item => ({
        ...item,
        // Calculate the subtotal for the line item using the retrieved unit price
        line_subtotal: item.price * item.quantity,
    }));

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.line_subtotal, 0);

    return {
        items: calculatedItems,
        summary: {
            subtotal: subtotal,
            total: subtotal, // Simple total calculation (no tax/shipping logic here)
            item_count: calculatedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
    };
};

// ----------------------------------------------------
// CORE PROFILE & ADDRESS FUNCTIONS
// ----------------------------------------------------

/**
 * @description Retrieves a user's profile information.
 * Ensures snake_case fields are exposed with mixed casing for frontend compatibility.
 */
exports.getUserProfile = async (req, res) => {
    try {
        const { uid } = req.user;
        const user = await userService.findUserById(uid);
        
        if (!user) {
            return res.status(404).json({ message: 'User profile not found.' });
        }
        
        // Return data using the mixed format expected by the frontend for sync
        res.status(200).json({
            uid: user.uid,
            email: user.email,
            firstName: user.first_name, // Mapped to camelCase
            lastName: user.last_name,   // Mapped to camelCase
            role: user.role,
            wishlist: user.wishlist || [],
            addresses: user.addresses || [],
            phone_number: user.phone_number, // Expose phone_number using DB key
        });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: 'Internal server error fetching user profile.' });
    }
};

/**
 * @description PUT /api/user/profile - Protected route for users to update their profile.
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const { uid } = req.user;
        const updateData = req.body; // Contains { firstName, lastName, phoneNumber } (camelCase)
        
        // Delegate update to service layer
        const updatedUser = await userService.updateUserProfile(uid, updateData);
        
        // Return data using the mixed format expected by the frontend for sync
        res.status(200).json({ 
            message: 'Profile updated successfully',
            updatedUser: {
                uid: updatedUser.uid,
                email: updatedUser.email,
                firstName: updatedUser.first_name, // Mapped
                lastName: updatedUser.last_name,   // Mapped
                role: updatedUser.role,
                addresses: updatedUser.addresses || [],
                wishlist: updatedUser.wishlist || [],
                phone_number: updatedUser.phone_number, // Ensure phone number is returned
            }
        });
    } catch (error) {
        console.error("Error processing profile update:", error);
        res.status(500).json({ message: error.message || 'Internal Server Error during profile update.' });
    }
};

/**
 * @description POST /api/user/addresses - Adds a new address for the authenticated user.
 */
exports.addAddress = async (req, res) => {
    try {
        const { uid } = req.user;
        const addressData = req.body; 

        const updatedAddresses = await userService.addAddress(uid, addressData);
        
        res.status(201).json({
            message: 'Address added successfully.',
            addresses: updatedAddresses
        });
    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).json({ message: error.message || 'Internal server error adding address.' });
    }
};

/**
 * @description PUT /api/user/addresses/:addressId - Updates an existing address or sets it as default.
 */
exports.updateAddress = async (req, res) => {
    try {
        const { uid } = req.user;
        const { addressId } = req.params;
        const updateData = req.body; 
        
        const updatedAddresses = await userService.updateAddress(uid, addressId, updateData);
        
        res.status(200).json({
            message: 'Address updated successfully.',
            addresses: updatedAddresses
        });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ message: error.message || 'Internal server error updating address.' });
    }
};

/**
 * @description DELETE /api/user/addresses/:addressId - Deletes a user address.
 */
exports.deleteAddress = async (req, res) => {
    try {
        const { uid } = req.user;
        const { addressId } = req.params;
        
        const updatedAddresses = await userService.deleteAddress(uid, addressId);
        
        res.status(200).json({
            message: 'Address deleted successfully.',
            addresses: updatedAddresses
        });
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ message: error.message || 'Internal server error deleting address.' });
    }
};

// ----------------------------------------------------
// NEW: ADMIN USER MANAGEMENT FUNCTIONS
// ----------------------------------------------------

/**
 * @description GET /api/user/users - Admin route to fetch all user profiles.
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        
        res.status(200).json({ 
            message: 'Users fetched successfully',
            count: users.length,
            users: users 
        });
    } catch (error) {
        console.error("Controller Error in getAllUsers:", error);
        res.status(500).json({ message: 'Internal Server Error fetching users.' });
    }
};

/**
 * @description PUT /api/user/users/:userId/status - Admin route to update block/active status.
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status: newStatus, durationDays } = req.body;

        if (!newStatus) {
            return res.status(400).json({ message: 'Status is required.' });
        }
        
        const updatedUser = await userService.updateUserStatus(userId, newStatus, durationDays);
        
        res.status(200).json({ 
            message: `User ${userId} status updated to ${newStatus}.`,
            user: updatedUser 
        });

    } catch (error) {
        console.error("Controller Error in updateUserStatus:", error);
        res.status(500).json({ message: error.message || 'Internal Server Error updating user status.' });
    }
};

/**
 * @description PUT /api/user/status/online - Protected route to update online status.
 */
exports.updateUserOnlineStatus = async (req, res) => {
    try {
        const { uid } = req.user;
        const { isOnline } = req.body; // Expects true or false

        if (typeof isOnline !== 'boolean') {
             return res.status(400).json({ message: 'isOnline status is required and must be a boolean.' });
        }
        
        // This service call handles setting is_online, session_start_time, and accumulating time on disconnect
        await userService.updateUserOnlineStatus(uid, isOnline);
        
        res.status(200).json({ 
            message: `User status updated to ${isOnline ? 'Online' : 'Offline'}.`
        });

    } catch (error) {
        console.error("Controller Error in updateUserOnlineStatus:", error);
        res.status(500).json({ message: error.message || 'Internal Server Error updating online status.' });
    }
};


// ----------------------------------------------------
// EXISTING FUNCTIONS (Wishlist, Verification, Cart, Reporting)
// ----------------------------------------------------

/**
 * @description Adds or removes a product ID from the authenticated user's wishlist array.
 */
exports.updateUserWishlist = async (req, res) => {
    try {
        const { uid } = req.user; 
        const { productId, action } = req.body; 
        
        if (!productId || (action !== 'add' && action !== 'remove')) {
            return res.status(400).json({ message: 'Invalid product ID or action (must be "add" or "remove").' });
        }

        const updatedWishlist = await userService.updateWishlist(uid, productId, action);
        
        res.status(200).json({
            message: `Product ${action}ed to wishlist successfully.`,
            wishlist: updatedWishlist,
            success: true
        });

    } catch (error) {
        console.error(`Error updating wishlist for user ${req.user.uid}:`, error);
        if (error.message.includes('not found')) {
             return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error updating wishlist.' });
    }
};

/**
 * @description Checks if the authenticated user has a verified (delivered) purchase history.
 */
exports.getVerificationStatus = async (req, res) => {
    try {
        const { uid } = req.user; 
        const { productId } = req.params;
        
        if (!productId) {
             return res.status(400).json({ message: 'Product ID is required for verification check.' });
        }

        const isVerified = await userService.checkUserVerifiedPurchase(uid, productId);
        
        res.status(200).json({
            productId: productId,
            isVerified: isVerified
        });

    } catch (error) {
        console.error(`Error checking purchase verification for user ${req.user.uid}:`, error);
        res.status(500).json({ message: 'Internal server error during verification check.' });
    }
};


// --- CART FUNCTIONS 
exports.getCartItems = async (req, res) => {
    const targetUid = req.params.uid || req.user.uid;
    const { role } = req.user;

    if (targetUid !== req.user.uid && role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden. You can only view your own cart.' });
    }

    try {
        const cartItems = await userService.fetchCartItems(targetUid);

        if (!cartItems) {
            return res.status(200).json({ items: [], summary: { subtotal: 0, total: 0, item_count: 0 } });
        }
        const responseData = processCartResponse(cartItems);
        res.status(200).json(responseData);

    } catch (error) {
        console.error(`Error fetching cart for user ${targetUid}:`, error);
        res.status(500).json({ message: 'Internal server error fetching cart.' });
    }
};

exports.updateCart = async (req, res) => {
    const { uid } = req.user;
    const { productId, selectedColor, selectedSize, quantity } = req.body;

    if (!productId || !selectedColor || !selectedSize || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: 'Invalid product details or quantity.' });
    }

    try {
        const product = await productService.getProductDetails(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        
        const currentPrice = product.price?.sale_price || product.price?.base_price || 0;
        const imageUrl = product.images?.image_url;
        
        if (currentPrice === 0 || !imageUrl) {
             return res.status(400).json({ message: 'Product is not available for purchase or missing pricing/image.' });
        }
        
        const itemToSave = {
            product_id: productId,
            selected_color: selectedColor,
            selected_size: selectedSize,
            quantity: quantity,
            product_name: product.product_name,
            image_url: imageUrl,
            price: currentPrice,
        };

        const updatedCartItems = await userService.updateCartItemInDb(uid, itemToSave);
        const responseData = processCartResponse(updatedCartItems);

        res.status(200).json({ 
            message: 'Cart updated successfully. Item added or quantity changed.',
            ...responseData
        });

    } catch (error) {
        console.error(`Error updating cart for user ${uid}:`, error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error updating cart.' });
    }
};

exports.removeCartItem = async (req, res) => {
    const { uid } = req.user;
    const { itemId } = req.params;
    if (!itemId) { return res.status(400).json({ message: 'Cart Item ID is required.' }); }

    try {
        const updatedCartItems = await userService.removeCartItemFromDb(uid, itemId);
        const responseData = processCartResponse(updatedCartItems);
        res.status(200).json({ message: 'Item removed successfully.', ...responseData });
    } catch (error) {
        console.error(`Error removing item ${itemId} from cart for user ${uid}:`, error);
        if (error.message.includes('not found')) { return res.status(404).json({ message: error.message }); }
        res.status(500).json({ message: 'Internal server error removing item.' });
    }
};

exports.clearCart = async (req, res) => {
    const { uid } = req.user;
    try {
        await userService.clearCartInDb(uid);
        res.status(200).json({ message: 'Cart cleared successfully.', items: [], summary: { subtotal: 0, total: 0, item_count: 0 } });
    } catch (error) {
        console.error(`Error clearing cart for user ${uid}:`, error);
        res.status(500).json({ message: 'Internal server error clearing cart.' });
    }
};

// --- REPORTING FUNCTIONS 
exports.submitSupportTicket = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { complaintType, queryType, description, priority, related_id } = req.body;
        
        if (!complaintType || !description) {
            return res.status(400).json({ message: 'Complaint type and description are required.' });
        }
        const newTicket = await reportService.createSupportTicket(userId, {
            complaintType, queryType, description, priority: priority || 'MEDIUM', related_id
        });
        res.status(201).json({
            message: 'Support ticket submitted successfully. Ticket ID: ' + newTicket.ticket_id,
            ticket: newTicket
        });
    } catch (error) {
        console.error(`Error submitting ticket for user ${req.user.uid}:`, error);
        res.status(500).json({ message: 'Internal server error submitting ticket.' });
    }
};

exports.getAdminReports = async (req, res) => {
    try {
        const reports = await reportService.getAllReports();
        res.status(200).json({
            message: 'Admin reports fetched successfully.', count: reports.length, reports: reports
        });
    } catch (error) {
        console.error("Error fetching admin reports:", error);
        res.status(500).json({ message: 'Internal server error fetching reports.' });
    }
};