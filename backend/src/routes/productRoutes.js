// D:\stylescapes\backend\src\routes\productsRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// The order is now fixed to prevent /:id from being mistaken for /similar/:productId

// Public route to get a single product by ID
// Endpoint: GET /api/products/:id
router.get('/:id', 
    (req, res, next) => {
        console.log("CHECKPOINT 1A: Bullshit request hit route /:id.");
        next();
    },
    productController.getProductById
);

// NEW: Public route to get similar products based on category
// Endpoint: GET /api/products/similar/:productId
router.get('/similar/:productId', 
    (req, res, next) => {
        console.log("CHECKPOINT 1B: Bullshit request hit route /similar/:productId.");
        next();
    },
    productController.getSimilarProducts
);

// Public route to get all products for the main website
// Endpoint: GET /api/products
router.get('/', 
    (req, res, next) => {
        console.log("CHECKPOINT 1C: Bullshit request hit route /.");
        next();
    },
    productController.getProducts
);

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