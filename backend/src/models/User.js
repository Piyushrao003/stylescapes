// D:\stylescapes\backend\src\models\User.js

const User = {
    // Unique ID from Firebase Authentication
    uid: String,
    
    // User profile details
    first_name: String,
    last_name: String,
    email: String,
    phone_number: String,
    
    // Security and roles
    password: String, // Hashed password (managed by Firebase Auth in current flow)
    role: String, // e.g., 'user', 'admin'

    // --- CRITICAL UPDATE: Multi-Address Array ---
    addresses: [{
        // Unique ID for internal reference (e.g., addr-001, addr-002)
        id: String, 
        
        // CRITICAL: New flag to indicate the primary address
        is_default: Boolean,

        // Address fields (Consolidated to line 1 and 2)
        address_line_1: String, // House/Flat No. & Building Name
        address_line_2: String, // Street Address / Locality
        
        city: String,
        state: String,
        zip_code: String,
    }],
    
    // Timestamps
    created_at: String,
    updated_at: String,

    // References to subcollections
    // cart_items: [], // REMOVED/Obsolete
    // wishlist_id: String, // REMOVED (Replaced by wishlist array below)
    
    // --- UPDATED/NEW FIELDS ---
    
    // Directly store wishlist IDs
    wishlist: [String], // Array of product_ids (already in use)

    // Hybrid Cart Storage: Only stores critical user choices/quantities
    cart_items: [ 
        {
            // Unique Identifier for the specific cart line item.
            id: String, 
            product_id: String, // CRITICAL: Link to the Products collection
            selected_color: String, 
            selected_size: String,
            quantity: Number,
            added_at: String, // Timestamp for potential cleanup/tracking
        }
    ],
    // NOTE: The old singular 'address' map has been removed from this schema.
};

module.exports = User;