// D:\stylescapes\backend\src\routes\productsRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Public route to get a single product by ID
// Endpoint: GET /api/products/:id
router.get('/:id', productController.getProductById);

// NEW: Public route to get similar products based on category
// Endpoint: GET /api/products/similar/:productId
router.get('/similar/:productId', productController.getSimilarProducts);

// Public route to get all products for the main website
// Endpoint: GET /api/products
router.get('/', productController.getProducts);

// Admin-only route to create a new product
// Endpoint: POST /api/products
router.post('/', verifyAdmin, productController.createProduct);

// Admin-only route to update a product
// Endpoint: PUT /api/products/:id
router.put('/:id', verifyAdmin, productController.updateProduct);

// Admin-only route to delete a product
// Endpoint: DELETE /api/products/:id
router.delete('/:id', verifyAdmin, productController.deleteProduct);

module.exports = router;