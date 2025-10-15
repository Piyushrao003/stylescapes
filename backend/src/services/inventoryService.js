// D:\stylescapes\backend\src\services\inventoryService.js

const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * @description Generates a consistent, unique key for a product variant (item).
 * CRITICAL FIX: Retains the Product ID's original case to match Firestore Document IDs.
 * @param {string} productId 
 * @param {string} color 
 * @param {string} size 
 * @returns {string} The unique variant SKU (e.g., A9vKuk..._vintage-blue_l)
 */
const generateVariantSku = (productId, color, size) => {
    // Only normalize the color and size parts
    const normalizedColor = color.replace(/\s/g, '-').toLowerCase();
    const normalizedSize = size.toLowerCase();
    
    // Concatenates components. productId retains its original case.
    return `${productId}_${normalizedColor}_${normalizedSize}`;
};

/**
 * @description Creates the initial stock records for all variants of a new product.
 * @param {string} productId 
 * @param {Array<object>} initialStockVariants - Array of { color, size, stock_level }
 * @returns {Promise<void>}
 */
exports.saveInitialStock = async (productId, initialStockVariants) => {
    if (!initialStockVariants || initialStockVariants.length === 0) {
        throw new Error("Initial stock data is required to define variants.");
    }
    
    const batch = db.batch();
    const now = new Date().toISOString();

    // Trim the productId as a safety net
    const safeProductId = productId.trim();

    initialStockVariants.forEach(variant => {
        // Use the helper function to get the SKU key
        const variantSku = generateVariantSku(safeProductId, variant.color, variant.size);
        const variantRef = db.collection('variants').doc(variantSku);

        batch.set(variantRef, {
            // Save the safely trimmed product ID
            product_id: safeProductId, 
            variant_sku: variantSku,
            color: variant.color,
            size: variant.size,
            stock_level: variant.stock_level || 0, // Ensure stock_level is present
            created_at: now,
            updated_at: now
        });
    });

    await batch.commit();
};

/**
 * @description Retrieves the stock level for a single product variant.
 * @param {string} productId 
 * @param {string} color 
 * @param {string} size 
 * @returns {Promise<{stock_level: number, variant_sku: string}|null>} The stock data or null.
 */
exports.getVariantStock = async (productId, color, size) => {
    const variantSku = generateVariantSku(productId, color, size);
    
    try {
        const variantRef = db.collection('variants').doc(variantSku);
        const variantSnap = await variantRef.get();

        if (variantSnap.exists) {
            return { 
                stock_level: variantSnap.data().stock_level,
                variant_sku: variantSku
            };
        }
        // If document doesn't exist, assume 0 stock or inventory setup error
        return { stock_level: 0, variant_sku: variantSku }; 
    } catch (error) {
        console.error("Error retrieving variant stock:", error);
        throw new Error('Failed to access variant inventory.');
    }
};


/**
 * @description Atomically decreases the stock level for multiple order items in a single transaction.
 * @param {Array<object>} orderItems - Array of items from the order (must contain product_id, selected_color, selected_size, quantity).
 * @returns {Promise<void>}
 */
exports.decrementStock = async (orderItems) => {
    
    // 1. Map items to their unique variant SKUs for transaction reference
    const stockDeductions = orderItems.map(item => ({
        sku: generateVariantSku(item.product_id, item.selected_color, item.selected_size),
        quantity: item.quantity
    }));

    // 2. Execute the transaction
    await db.runTransaction(async (t) => {
        const batchRefs = stockDeductions.map(deduction => 
            db.collection('variants').doc(deduction.sku)
        );

        // Fetch all relevant stock documents in the transaction
        const snaps = await t.getAll(...batchRefs);
        const updates = {};
        
        // 3. Validate and prepare updates
        snaps.forEach((snap, index) => {
            const deduction = stockDeductions[index];
            const currentStock = snap.exists ? snap.data().stock_level : 0;
            const requiredQuantity = deduction.quantity;

            if (!snap.exists) {
                console.error(`Inventory Alert: Variant SKU ${deduction.sku} not found.`);
                throw new Error(`Inventory Error: Product variant inventory setup error.`);
            }

            if (currentStock < requiredQuantity) {
                // CRITICAL: Abort transaction if stock is insufficient
                console.error(`Insufficient stock for SKU ${deduction.sku}: ${currentStock} available, ${requiredQuantity} requested.`);
                throw new Error(`Insufficient stock for product variant. Only ${currentStock} available.`);
            }

            // Prepare the update operation: Decrement stock
            updates[snap.ref.path] = {
                stock_level: currentStock - requiredQuantity,
                updated_at: new Date().toISOString()
            };
        });

        // 4. Commit the updates (stock deduction)
        Object.keys(updates).forEach(path => {
            const ref = db.doc(path);
            t.update(ref, updates[path]);
        });
    });
};


/**
 * @description Deletes all variant documents linked to a specific Product ID.
 * @param {string} productId 
 * @returns {Promise<void>}
 */
exports.deleteAllVariants = async (productId) => {
    const variantsSnapshot = await db.collection('variants')
        .where('product_id', '==', productId.trim())
        .get();

    const batch = db.batch();
    variantsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
};

// Export the helper for other internal services (e.g., productService)
exports.generateVariantSku = generateVariantSku;