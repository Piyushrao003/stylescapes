// D:\stylescapes\frontend\src\api\ordersApi.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Fetches all orders (Admin only).
 * @param {string} token - The user's JWT token.
 * @returns {Promise<Array>} An array of order objects.
 */
export const getOrders = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
};

/**
 * Fetches a specific user's orders (User only).
 * @param {string} token - The user's JWT token.
 * @returns {Promise<Array>} An array of order objects belonging to the user.
 */
export const getOrdersByUserId = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders/user`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user orders:", error);
        throw error;
    }
};

/**
 * @description Creates a new order. Handles two scenarios (Cart/Direct Buy Now) 
 * and includes the shipping address ID for backend lookup.
 * * @param {object} orderData - The order data (totals, coupon, direct_item, and shippingAddressId).
 * @param {string} token - The user's JWT token.
 * @returns {Promise<object>} The new order object.
 */
export const createOrder = async (orderData, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

// PUT /api/orders/:id/status (Admin-only)
export const updateOrderStatus = async (id, newStatus, token) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/orders/${id}/status`, { newStatus }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};

/**
 * Fetches a transaction record by its ID (Admin only).
 */
export const getTransactionById = async (transactionId, token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/transactions/${transactionId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching transaction:", error);
        throw error;
    }
};