// D:\stylescapes\backend\src\models\Product.js

const Product = {
    // Unique ID from Firestore
    uid: String,
    
    // Core product details
    product_name: String,
    description: String,
    short_description: String,
    brand: String,
    category: String,
    style: String,
    sku: String,

    // --- VARIATION FIELDS ---
    available_colors: [
        {
            name: String,   // e.g., 'Obsidian Black', 'Midnight Blue'
            hex_code: String, // e.g., '#1a1a1a', '#2c3e50'
            // Optionally, different main image URL per color:
            image_url: String
        }
    ],
    available_sizes: [String], // e.g., ['S', 'M', 'L', 'XL', 'XXL']
    // --- END VARIATION FIELDS ---

    // Price and sales information
    price: {
        base_price: Number,
        sale_price: Number,
        is_on_sale: Boolean,
    },
    
    // Inventory details - REMOVED GENERIC STOCK_QUANTITY FIELD.
    // Stock is now tracked separately per variant in the 'variants' collection 
    // using the new Inventory.js model structure.
    
    // Image URLs
    images: {
        image_url: String, // Main image (primary default image)
        additional_images: [String], 
    },
    
    // SEO metadata
    seo: {
        meta_title: String,
        meta_description: String,
        alug: String, 
    },
    
    // Timestamps
    created_at: String,
    updated_at: String,
};

module.exports = Product;
