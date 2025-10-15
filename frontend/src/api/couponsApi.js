// D:\stylescapes\frontend\src\api\couponsApi.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Fetches all coupons (Admin only).
 * @param {string} token - The user's JWT token.
 * @returns {Promise<Array>} An array of coupon objects.
 */
export const getCoupons = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/coupons`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching coupons:", error);
        throw error;
    }
};

/**
 * Creates a new coupon (Admin only).
 * @param {object} couponData - The coupon data.
 * @param {string} token - The user's JWT token.
 * @returns {Promise<object>} The new coupon object.
 */
export const createCoupon = async (couponData, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/coupons`, couponData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating coupon:", error);
        throw error;
    }
};

/**
 * Updates an existing coupon (Admin only).
 * @param {string} id - The ID of the coupon to update.
 * @param {object} couponData - The updated coupon data.
 * @param {string} token - The user's JWT token.
 * @returns {Promise<object>} The updated coupon object.
 */
export const updateCoupon = async (id, couponData, token) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/coupons/${id}`, couponData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating coupon:", error);
        throw error;
    }
};

/**
 * Deletes a coupon (Admin only).
 * @param {string} id - The ID of the coupon to delete.
 * @param {string} token - The user's JWT token.
 * @returns {Promise<object>} The deletion confirmation message.
 */
export const deleteCoupon = async (id, token) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/coupons/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting coupon:", error);
        throw error;
    }
};

/**
 * NEW: Validates a coupon code against the backend for user application during checkout.
 * Endpoint: POST /api/coupons/validate
 * @param {string} couponCode - The code to validate.
 * @returns {Promise<object>} The validated coupon data (discount_type, discount_value) if successful.
 */
export const validateCoupon = async (couponCode) => {
    try {
        // Send the coupon code to the backend for security and rule checks
        const response = await axios.post(`${API_BASE_URL}/coupons/validate`, { couponCode });
        
        // Backend returns 200 OK with the coupon's discount details embedded in response.data.coupon
        return response.data.coupon;
    } catch (error) {
        console.error("Error validating coupon:", error);
        // Throw the error so the frontend can display the message (e.g., "Invalid")
        throw error;
    }
};