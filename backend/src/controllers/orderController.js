// D:\stylescapes\backend\src\controllers\orderController.js

const orderService = require('../services/orderService');
const { verifyAdmin, verifyUser } = require('../middleware/authMiddleware');
const { db } = require('../config/firebase');

// GET /api/orders - Admin-only route to get all orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// GET /api/user/orders - User-specific route to get their own orders
exports.getOrdersByUserId = async (req, res) => {
    try {
        const userId = req.user.uid;
        const orders = await orderService.getOrdersByUser(userId);
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @description POST /api/orders - Protected route for users to create a new order.
 * This route now handles two scenarios:
 * 1. Standard Checkout (req.body contains shipping/coupon data, order_items are calculated from user's cart in service layer).
 * 2. Direct Buy Now (req.body contains shipping/coupon data AND a single 'direct_item' payload).
 */
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.uid;
        // The service layer will inspect orderData to determine the flow (Cart vs. Direct Item)
        const orderData = req.body; 
        
        const newOrder = await orderService.createOrder(userId, orderData);
        
        // Success response
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error("Order Creation Error:", error);
        
        // CRITICAL: Handle specific stock-related errors from the service layer
        if (error.message.includes('Insufficient stock') || error.message.includes('Inventory Error') || error.message.includes('Missing cart items')) {
            // Return 400 for client-side correctable errors (e.g., out of stock, cart is empty)
            return res.status(400).json({ message: error.message });
        }
        
        // Generic error response for database failures, service issues, etc.
        res.status(500).json({ message: 'Internal Server Error during order processing.' });
    }
};

// PUT /api/orders/:id/status - Admin-only route to update an order's status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { newStatus } = req.body;
        await orderService.updateOrderStatus(id, newStatus);
        res.status(200).json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};