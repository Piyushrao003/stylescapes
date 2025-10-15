// D:\stylescapes\frontend\src\api\transactionsApi.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Fetches a transaction record by its ID (Admin only).
 * @param {string} transactionId - The ID of the transaction.
 * @param {string} token - The user's JWT token.
 * @returns {Promise<object>} The transaction object.
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

// Note: The 'recordTransaction' function is typically called by a payment gateway's
// webhook, not from the frontend, so we don't need a client-side API function for it.