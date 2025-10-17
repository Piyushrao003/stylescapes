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
    role: String, // e.g., 'user', 'admin'
    status: String, // 'Active' | 'Blocked' etc.
    
    status_details: {
        is_blocked: Boolean,
        block_reason: String,
        block_expiry: String, // ISO date string for temporary blocks
    },
    
    // --- CRITICAL NEW ACTIVITY & METRIC FIELDS ---
    is_online: Boolean,             // Real-time status (True/False)
    last_login_at: String,          // ISO timestamp of last successful login
    total_online_seconds: Number,   // Cumulative metric for engagement tracking
    session_start_time: String,     // Temporary field to calculate time delta when user logs off
    // --- END NEW FIELDS ---
    
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

    // Hybrid Cart Storage
    cart_items: [ 
        {
            id: String, 
            product_id: String, 
            selected_color: String, 
            selected_size: String,
            quantity: Number,
            added_at: String,
        }
    ],
};

module.exports = User;