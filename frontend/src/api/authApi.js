// D:\stylescapes\frontend\src\api\authApi.js

import axios from 'axios';
// Removed: No Firebase client SDK imports are needed here, only axios.

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * @description Registers a new user by sending the Firebase ID Token and profile data 
 * to the backend to create the profile in Firestore.
 * @param {object} registrationData - Contains the 'token' (Firebase ID Token) and profile fields.
 * @returns {Promise<object>} The registration success message (or eventual Session JWT).
 */
export const registerUser = async (registrationData) => {
    try {
        // Now sending the secure Firebase ID Token and user data to the backend
        const response = await axios.post(`${API_BASE_URL}/auth/register`, registrationData);
        return response.data;
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
};

/**
 * @description Logs in a user by sending the Firebase ID Token to the backend 
 * for verification and to receive a custom Session JWT.
 * @param {object} credentials - MUST contain the 'token' (Firebase ID Token).
 * @returns {Promise<object>} The backend's response containing the custom Session JWT and profile data.
 */
export const loginUser = async (credentials) => {
    try {
        // Now sending the secure Firebase ID Token to the backend
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return response.data;
    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }
};

/**
 * @description Fetches the user's profile information from the backend using the custom Session JWT.
 * This function remains the same as it correctly uses the Session JWT.
 * @param {string} token - The user's custom Session JWT.
 * @returns {Promise<object>} The user's profile data.
 */
export const getUserProfile = async (token) => {
    try {
        // This correctly uses the custom Session JWT in the Authorization header
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

// Removed obsolete functions/notes related to raw credentials.