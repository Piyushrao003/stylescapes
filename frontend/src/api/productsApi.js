// File Path: frontend/src\api\productsApi.js

import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/products`;

/**
 * Fetches all products.
 * @returns {Promise<Array>} An array of products.
 */
export const getProducts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetches a single product by its ID.
 * @param {string} id - The product ID.
 * @returns {Promise<object>} The product object.
 */
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

/**
 * NEW: Fetches products that share the same category as the current product.
 * Endpoint: GET /api/products/similar/:productId
 * @param {string} productId - The ID of the current product.
 * @returns {Promise<Array>} An array of similar product objects.
 */
export const getSimilarProducts = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/similar/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching similar products for ${productId}:`, error);
    // Return empty array on failure
    return []; 
  }
};


/**
 * Creates a new product (Admin only).
 * @param {object} productData - The complete product data to create, including variations.
 * @param {string} token - The admin's JWT token.
 * @returns {Promise<object>} The new product object.
 */
export const createProduct = async (productData, token) => {
  try {
    const response = await axios.post(API_URL, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};


/**
 * Updates a product (Admin only).
 * @param {string} id - The product ID.
 * @param {object} productData - The product data to update, including variations.
 * @param {string} token - The admin's JWT token.
 * @returns {Promise<object>} The updated product object.
 */
export const updateProduct = async (id, productData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Deletes a product (Admin only).
 * @param {string} id - The product ID.
 * @param {string} token - The admin's JWT token.
 * @returns {Promise<object>} The deletion confirmation message.
 */
export const deleteProduct = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * @description Fetches a specified number of random products.
 * @param {number} count - The number of random products to fetch.
 * @returns {Promise<Array>} An array of random product objects.
 */
export const getRandomProducts = async (count = 6) => {
  try {
    const response = await axios.get(`${API_URL}`);
    const allProducts = response.data;

    if (allProducts.length === 0) {
      return [];
    }

    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  } catch (error) {
    console.error('Error fetching random products:', error);
    throw error;
  }
};