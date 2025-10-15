// D:\stylescapes\backend\src\models\Inventory.js

/**
 * @description Defines the schema for a single product variant's inventory record.
 * This document is stored in the 'variants' collection and replaces the generic stock_quantity
 * field in the main Product.js model for accurate stock control per size/color combination.
 * * NOTE: The combination of productId, color, and size defines the unique variant.
 */
const Inventory = {
    // Unique ID from Firestore (auto-generated)
    id: String,

    // Foreign Key: Links to the main Product document
    product_id: String,

    // Unique identifier for this specific variant (e.g., PRODUCTID_COLORNAME_SIZE)
    variant_sku: String, 

    // Variant attributes (for indexing and lookup)
    color: String,       // e.g., 'Obsidian Black'
    size: String,        // e.g., 'M'

    // Critical Inventory Field
    stock_level: Number, // The actual quantity currently in stock

    // Price override for a specific variant (optional, but good for complex pricing)
    // price_override: Number, 

    // Timestamps
    created_at: String,
    updated_at: String,
};

module.exports = Inventory;
