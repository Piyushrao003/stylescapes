// D:\stylescapes\frontend\src\api\userApi.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ----------------------------------------------------------------------
// --- CORE PROFILE & AUTH FUNCTIONS (Updated Return Structure) ---
// ----------------------------------------------------------------------

/**
 * @description Fetches the user's profile information from the backend using the custom Session JWT.
 * NOTE: Backend now returns the 'addresses' array.
 * @param {string} token - The user's custom Session JWT.
 * @returns {Promise<object>} The user's profile data, including addresses.
 */
export const getUserProfile = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // The response.data now correctly contains { uid, email, firstName, lastName, role, wishlist, addresses }
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
};

/**
 * @description Updates core user profile fields (name, phone number) in the database.
 * This is used by ProfileDetails.js.
 * @param {object} updateData - Payload containing { firstName, lastName, phoneNumber, etc. }
 * @param {string} token - The user's Session JWT.
 * @returns {Promise<object>} The updated user profile snapshot.
 */
export const updateUserProfile = async (updateData, token) => {
    // NOTE: This assumes the backend has a general user update endpoint (PUT /api/user/profile)
    // We are routing the profile update through a simple PUT call for now.
    try {
        const response = await axios.put(`${API_BASE_URL}/user/profile`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Backend should return the full updated user object
        return response.data; 
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};


// ----------------------------------------------------------------------
// --- NEW ADDRESS MANAGEMENT FUNCTIONS (CRUD) ---
// ----------------------------------------------------------------------

/**
 * @description Adds a new address to the user's list.
 * Endpoint: POST /api/user/addresses
 * @param {object} addressData - The address payload (address_line_1, zip_code, etc. - snake_case).
 * @param {string} token - The user's Session JWT.
 * @returns {Promise<Array>} The updated array of user addresses.
 */
export const addAddress = async (addressData, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/user/addresses`, addressData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.addresses;
    } catch (error) {
        console.error("Error adding new address:", error);
        throw error;
    }
};

/**
 * @description Updates an existing address or sets a new default.
 * Endpoint: PUT /api/user/addresses/:addressId
 * @param {string} addressId - The ID of the address to modify.
 * @param {object} updateData - Partial address data or { is_default: true }.
 * @param {string} token - The user's Session JWT.
 * @returns {Promise<Array>} The updated array of user addresses.
 */
export const updateAddress = async (addressId, updateData, token) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/user/addresses/${addressId}`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.addresses;
    } catch (error) {
        console.error(`Error updating address ${addressId}:`, error);
        throw error;
    }
};

/**
 * @description Deletes an address from the user's list.
 * Endpoint: DELETE /api/user/addresses/:addressId
 * @param {string} addressId - The ID of the address to delete.
 * @param {string} token - The user's Session JWT.
 * @returns {Promise<Array>} The updated array of user addresses.
 */
export const deleteAddress = async (addressId, token) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/user/addresses/${addressId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.addresses;
    } catch (error) {
        console.error(`Error deleting address ${addressId}:`, error);
        throw error;
    }
};

// ----------------------------------------------------------------------
// --- EXISTING FUNCTIONS (Wishlist, Cart, Verification) ---
// ----------------------------------------------------------------------

/**
 * @description Updates the user's wishlist (Add or Remove a product ID).
 * Endpoint: PUT /api/user/wishlist
 */
export const updateUserWishlist = async (userId, productId, token, action) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/user/wishlist`, 
        { productId, action }, 
        { headers: { Authorization: `Bearer ${token}` } });
        
        return { success: true, data: response.data }; 

    } catch (error) {
        console.error(`Error updating wishlist for user ${userId}:`, error);
        throw error;
    }
};

/**
 * @description Checks the authenticated user's purchase status for a specific product.
 * Endpoint: GET /api/user/verify-purchase/:productId
 */
export const checkVerificationStatus = async (productId, token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/verify-purchase/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error checking verification status for product ${productId}:`, error);
        return { productId, isVerified: false };
    }
};


// --- CART FUNCTIONS ---

/**
 * @description Fetches the authenticated user's cart items.
 * Endpoint: GET /api/user/cart
 */
export const getCart = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.items || [];
    } catch (error) {
        console.error("Error fetching cart:", error);
        throw error; 
    }
};

/**
 * @description Adds a new item or updates the quantity/details of an existing item in the cart.
 * Endpoint: POST /api/user/cart
 */
export const updateCartItem = async (token, itemDetails) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/user/cart`, itemDetails, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating cart item:", error);
        throw error;
    }
};

/**
 * @description Removes a specific item from the cart.
 * Endpoint: DELETE /api/user/cart/:itemId
 */
export const removeCartItem = async (token, itemId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/user/cart/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error removing item:", error);
        throw error;
    }
};

/**
 * @description Clears all items from the cart.
 * Endpoint: DELETE /api/user/cart/clear
 */
export const clearCart = async (token) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/user/cart/clear`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
};


// ----------------------------------------------------------------------
// --- REPORTING FUNCTIONS ---
// ----------------------------------------------------------------------

/**
 * @description Allows an authenticated user to submit a support ticket (complaint/issue).
 * Endpoint: POST /api/user/submit-ticket
 */
export const submitSupportTicket = async (ticketData, token) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/user/submit-ticket`, ticketData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error submitting support ticket:", error);
        throw error;
    }
};

/**
 * @description Fetches all reports and support tickets (Admin Only).
 * Endpoint: GET /api/user/admin/reports
 */
export const getAdminReports = async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/admin/reports`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching admin reports:", error);
        throw error;
    }
};