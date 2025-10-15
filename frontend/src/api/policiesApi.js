// D:\stylescapes\frontend\src\api\policiesApi.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * @description Fetches content for a specific policy (e.g., 'terms', 'privacy'). Publicly accessible.
 * @param {string} policyId - The ID of the policy document in Firestore.
 * @returns {Promise<object>} The policy object { id, title, content_html, last_updated }.
 */
export const getPolicy = async (policyId) => {
    try {
        // GET /api/policies/terms
        const response = await axios.get(`${API_BASE_URL}/policies/${policyId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching policy ${policyId}:`, error);
        throw error;
    }
};

/**
 * @description Updates the policy content (Admin Only).
 * @param {string} policyId - The ID of the policy document.
 * @param {object} updatedContent - Object containing { content_html: string, title: string, policy_type: string }.
 * @param {string} token - The Admin's Session JWT.
 * @returns {Promise<object>} Confirmation message and last updated date.
 */
export const updatePolicy = async (policyId, updatedContent, token) => {
    try {
        // PUT /api/policies/terms
        const response = await axios.put(`${API_BASE_URL}/policies/${policyId}`, updatedContent, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating policy ${policyId}:`, error);
        throw error;
    }
};