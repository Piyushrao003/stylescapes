// D:\stylescapes\backend\src\models\Coupon.js

const Coupon = {
    // Unique ID from Firestore
    uid: String,
    
    // Coupon details
    coupon_code: String,
    description: String,
    discount_type: String, // e.g., 'percentage', 'flat_rate'
    discount_value: Number,
    
    // Validity and usage
    start_date: String,
    end_date: String,
    minimum_order: Number,
    is_active: Boolean,
    
    // Usage limits
    usage: {
        max_users: Number,
        uses_per_customer: Number,
        used_count: Number, // Auto-updated
    },
    
    // Product and category restrictions
    valid_for_category: [String], // Array of category IDs
    valid_for_products: [String], // Array of product IDs
    
    // Timestamps
    created_at: String,
    updated_at: String,
};

module.exports = Coupon;