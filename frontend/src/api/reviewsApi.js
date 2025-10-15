// D:\stylescapes\frontend\src\api\reviewsApi.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Fetches all reviews for a specific product.
 * @param {string} productId - The ID of the product.
 * @returns {Promise<Array>} An array of published review objects.
 */
export const getReviewsForProduct = async (productId) => {
    try {
        // NOTE: Backend is configured to only return PUBLISHED reviews.
        const response = await axios.get(`${API_BASE_URL}/reviews/${productId}/reviews`);
        // Return array or default to empty array on success
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("Error fetching reviews:", error);
        // Return empty array on network failure to prevent frontend crash
        return [];
    }
};

/**
 * Creates a new review for a product (User only).
 * @param {object} reviewData - The review data, including rating, comment, isVerified, etc.
 * @param {string} token - The user's JWT token.
 * @returns {Promise<object>} The new review object.
 */
export const createReview = async (reviewData, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating review:", error);
        throw error;
    }
};

/**
 * NEW: Retrieves an existing review by User ID and Product ID (for Edit mode).
 * Endpoint: GET /api/reviews/user-review/:productId
 * @param {string} userId - The ID of the user. (Not explicitly used, but kept for context)
 * @param {string} productId - The ID of the product.
 * @param {string} token - The user's JWT token.
 * @returns {Promise<object|null>} The existing review document or null.
 */
export const getExistingReview = async (userId, productId, token) => {
    try {
        // Hitting the dedicated route for review existence check
        const response = await axios.get(`${API_BASE_URL}/reviews/user-review/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Backend returns 200 OK with the review object if found
        return response.data; 

    } catch (error) {
        // If 404 (No review found), return null to trigger the 'Write Review' state
        if (error.response && error.response.status === 404) {
            return null;
        }
        console.error("Error fetching existing review status:", error);
        return null;
    }
};

/**
 * NEW: Updates an existing review (User only).
 * Endpoint: PUT /api/reviews/:id
 * @param {string} reviewId - The ID of the review to update.
 * @param {object} updateData - The updated review data (rating, comment, etc.).
 * @param {string} token - The user's JWT token.
 * @returns {Promise<void>}
 */
export const updateReview = async (reviewId, updateData, token) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/reviews/${reviewId}`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating review ${reviewId}:`, error);
        throw error;
    }
};


/**
 * Deletes a review (User or Admin).
 * @param {string} reviewId - The ID of the review to delete.
 * @param {string} token - The user's JWT token.
 * @returns {Promise<object>} The deletion confirmation message.
 */
export const deleteReview = async (reviewId, token) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting review:", error);
        throw error;
    }
};