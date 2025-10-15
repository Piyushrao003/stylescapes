// D:\stylescapes\backend\src\controllers\productController.js

const productService = require('../services/productService');
const { db } = require('../config/firebase');
const { verifyAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// GET /api/products/:id - Public route to get a single product
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // CRITICAL FIX: Use the service layer (productService.getProductDetails) 
        // to fetch the product. This function ensures the variant inventory 
        // (variant_inventory map) is queried and attached to the product object.
        const productData = await productService.getProductDetails(id);

        if (productData) {
            // productData now contains the attached inventory map
            res.status(200).json(productData);
        } else {
            res.status(404).json({ message: 'Product Not Found' });
        }
    } catch (error) {
        console.error("Error in getProductById:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// GET /api/products - Public route to get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await db.collection('products').get();
        const productsData = products.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(productsData);
    } catch (error) {
        console.error("Error in getProducts:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// NEW: GET /api/products/similar/:productId - Public route to get similar products
exports.getSimilarProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // 1. Get the current product details to find its category
        const currentProduct = await productService.getProductDetails(productId);

        if (!currentProduct || !currentProduct.category) {
            // If the product doesn't exist or has no category, return an empty array
            return res.status(200).json([]);
        }

        const category = currentProduct.category;

        // 2. Use the service layer to fetch products with the same category
        const similarProducts = await productService.getSimilarProducts(productId, category);
        
        res.status(200).json(similarProducts);

    } catch (error) {
        console.error("Error in getSimilarProducts:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// POST /api/products - Admin-only route to create a new product
exports.createProduct = async (req, res) => {
    try {
        // CRITICAL UPDATE: Destructure the 'initial_stock_variants' array from the body.
        const { initial_stock_variants, ...productData } = req.body; 
        
        // Call the service layer function that manages the transactional creation 
        // of both the product and its initial variant inventory.
        const newProduct = await productService.createProduct(productData, initial_stock_variants);
        
        res.status(201).json({ 
            message: 'Product and initial inventory created successfully',
            id: newProduct.id
        });
    } catch (error) {
        console.error("Error in createProduct:", error);
        // Handle specific inventory error thrown by service for better client feedback
        const statusCode = error.message.includes("Inventory Error") || error.message.includes("Missing initial stock") ? 400 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};

// PUT /api/products/:id - Admin-only route to update a product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // NOTE: productData now implicitly includes available_colors and available_sizes from req.body
        const productData = req.body; 
        
        const productRef = db.collection('products').doc(id);
        await productRef.update({
            ...productData,
            updated_at: new Date().toISOString()
        });
        res.status(200).json({ message: 'Product updated successfully', id });
    } catch (error) {
        console.error("Error in updateProduct:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// DELETE /api/products/:id - Admin-only route to delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productRef = db.collection('products').doc(id);
        await productRef.delete();
        res.status(200).json({ message: 'Product deleted successfully', id });
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};