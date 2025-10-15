// D:\stylescapes\frontend\src\api\shippingApi.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Fetches all shipping methods.
 * @returns {Promise<Array>} An array of shipping method objects.
 */
export const getShippingMethods = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/shipping`);
        return response.data;
    } catch (error) {
        console.error("Error fetching shipping methods:", error);
        throw error;
    }
};

/**
 * Creates a new shipping method (Admin only).
 * @param {object} methodData - The shipping method data.
 * @param {string} token - The admin's JWT token.
 * @returns {Promise<object>} The new shipping method object.
 */
export const createShippingMethod = async (methodData, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/shipping`, methodData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating shipping method:", error);
        throw error;
    }
};

/**
 * Updates an existing shipping method (Admin only).
 * @param {string} id - The ID of the method to update.
 * @param {object} methodData - The updated method data.
 * @param {string} token - The admin's JWT token.
 * @returns {Promise<object>} The updated method object.
 */
export const updateShippingMethod = async (id, methodData, token) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/shipping/${id}`, methodData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating shipping method:", error);
        throw error;
    }
};