// D:\stylescapes\backend\src\services\productService.js

// Assuming 'db' is the Firestore Admin SDK reference imported from the config file.
const { db } = require('../config/firebase');
const inventoryService = require('./inventoryService'); // CRITICAL: Import Inventory Service

// Helper to attach stock information from the variants collection to a product
const attachStockInfo = async (productId, productData) => {
    // Check if the product has variations defined
    if (!productData.available_colors && !productData.available_sizes) {
        return { ...productData, variant_inventory: {}, total_stock_level: 0 };
    }

    // CRITICAL FIX: Trim the productId before querying to bypass invisible whitespace
    const safeProductId = productId.trim(); 

    // Fetch all variants for this product
    const variantsSnapshot = await db.collection('variants')
        .where('product_id', '==', safeProductId) // Query using the trimmed ID
        .get();

    const stockByVariant = {};
    let totalStock = 0;

    variantsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        stockByVariant[doc.id] = data;
        totalStock += data.stock_level;
    });
    
    // Attach the fetched variant data to the product object
    return {
        ...productData,
        variant_inventory: stockByVariant,
        total_stock_level: totalStock
    };
};

/**
 * @description Retrieves a single product's details by its ID, now including variant stock info.
 * @param {string} productId - The unique ID of the product.
 * @returns {Promise<object|null>} The product document with attached stock or null if not found.
 */
exports.getProductDetails = async (productId) => {
    try {
        const productRef = db.collection('products').doc(productId);
        const productSnap = await productRef.get();

        if (productSnap.exists) {
            let productData = { id: productSnap.id, ...productSnap.data() };
            // Pass the product ID from the document snapshot for attachment
            const currentProductId = productSnap.id; 
            
            productData = await attachStockInfo(currentProductId, productData);
            return productData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error in getProductDetails:", error);
        throw new Error('Failed to retrieve product details.');
    }
};

/**
 * @description Retrieves a batch of product details by their IDs for cart lookups.
 * @param {Array<string>} productIds - Array of unique product IDs.
 * @returns {Promise<object>} A map of { productId: productData }.
 */
exports.getProductsDetailsBatch = async (productIds) => {
    const productMap = {};
    if (productIds.length === 0) return productMap;

    try {
        const productRefs = productIds.map(id => db.collection('products').doc(id));
        const snapshots = await db.getAll(...productRefs);

        const stockPromises = [];

        snapshots.forEach(doc => {
            if (doc.exists) {
                let productData = { id: doc.id, ...doc.data() };
                productMap[doc.id] = productData;
                // Add promise to attach stock info
                stockPromises.push(attachStockInfo(doc.id, productData).then(data => {
                    productMap[doc.id] = data; // Overwrite with data including stock
                }));
            } else {
                productMap[doc.id] = { status: 'deleted' };
            }
        });

        // Wait for all stock promises to resolve
        await Promise.all(stockPromises);

        return productMap;
    } catch (error) {
        console.error("Error in getProductsDetailsBatch:", error);
        throw new Error('Failed to retrieve product details batch for cart.');
    }
};


/**
 * @description CREATES a new product AND its initial variant stock in a single transaction.
 * @param {object} productData - The product metadata (name, price, colors, sizes, etc.).
 * @param {Array} initialStockVariants - Array of { color, size, stock_level } objects.
 * @returns {Promise<object>} The new product document with its ID.
 */
exports.createProduct = async (productData, initialStockVariants) => {
    if (!initialStockVariants || initialStockVariants.length === 0) {
         throw new Error("Missing initial stock data for variants. Product cannot be created without stock definition.");
    }
    
    // 1. Prepare data for the main products collection
    const productToSave = {
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    // 2. Save the main product document first to get the unique ID
    const docRef = await db.collection('products').add(productToSave);
    const productId = docRef.id;
    
    try {
        // 3. Save the initial stock data using the new product ID
        await inventoryService.saveInitialStock(productId, initialStockVariants);

        return { id: productId, ...productToSave };

    } catch (inventoryError) {
        console.error(`CRITICAL: Failed to save initial stock for new product ${productId}. Rolling back product creation.`, inventoryError);
        
        // 4. ROLLBACK: If stock saving fails, delete the main product document to keep the database clean.
        await db.collection('products').doc(productId).delete();

        // Re-throw a specific error for the controller to catch
        throw new Error(`Inventory Error: Product creation failed. ${inventoryError.message}. Product rollback executed.`);
    }
};


// --- EXISTING FUNCTIONS (FULL IMPLEMENTATION FOLLOWS) ---

/**
 * @description Retrieves all products from Firestore, now ensuring stock info is attached.
 * @returns {Promise<Array>} An array of all product documents.
 */
exports.getAllProducts = async () => {
    try {
        const productSnapshot = await db.collection('products').get(); 
        const products = [];
        const stockPromises = [];

        productSnapshot.docs.forEach(doc => {
            let productData = { id: doc.id, ...doc.data() };
            products.push(productData);
            // Attach stock asynchronously
            stockPromises.push(attachStockInfo(doc.id, productData));
        });
        
        // Wait for all stock info to be attached
        const productsWithStock = await Promise.all(stockPromises);

        return productsWithStock;

    } catch (error) {
        console.error("Error in getAllProducts:", error);
        throw new Error('Failed to retrieve products.');
    }
};

/**
 * @description NEW: Retrieves products that share the same category as the current product.
 * @param {string} currentProductId - The ID of the product currently being viewed.
 * @param {string} category - The category of the current product (e.g., 't-shirt').
 * @param {number} [limit=6] - Max number of similar products to return.
 * @returns {Promise<Array>} An array of similar product documents.
 */
exports.getSimilarProducts = async (currentProductId, category, limit = 6) => {
    if (!category) return [];

    try {
        // Query products by category
        const productsSnap = await db.collection('products')
            .where('category', '==', category)
            .limit(limit + 1) // Fetch one extra to filter out the current product
            .get();

        const similarProducts = productsSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            // Filter out the product currently being viewed
            .filter(product => product.id !== currentProductId)
            .slice(0, limit); // Enforce the final limit

        // NOTE: For simplicity in a similar products feed, we will NOT attach full variant stock here, 
        // but rely on the simplified product data fetched.

        return similarProducts;
    } catch (error) {
        console.error("Error in getSimilarProducts:", error);
        return []; // Return empty array on failure
    }
};

/**
 * @description Updates a product in Firestore.
 * @param {string|null} productId - The ID of the product.
 * @param {object} productData - The product data to save, excluding stock variants.
 * @returns {Promise<object>} The saved product document with its ID.
 */
exports.saveProduct = async (productId, productData) => {
    try {
        const productToUpdate = {
            ...productData, 
            updated_at: new Date().toISOString()
        };

        const productRef = db.collection('products').doc(productId);
        await productRef.update(productToUpdate);
        return { id: productId, ...productToUpdate };
        
    } catch (error) {
        console.error("Error in saveProduct:", error);
        throw new Error('Failed to save product.');
    }
};

/**
 * @description Deletes a product by its ID and cleans up associated variant records.
 * @param {string} productId - The unique ID of the product.
 * @returns {Promise<void>}
 */
exports.deleteProduct = async (productId) => {
    try {
        // OPTIMIZATION: Delete all associated variants first (Data Hygiene/Cost Saving)
        await inventoryService.deleteAllVariants(productId);
        
        // Then, delete the main product document
        await db.collection('products').doc(productId).delete();
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        throw new Error('Failed to delete product and its variants.');
    }
};