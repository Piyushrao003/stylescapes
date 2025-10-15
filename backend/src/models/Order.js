// D:\stylescapes\backend\src\models\Order.js

const Order = {
    // Unique ID from Firestore
    order_id: String,
    
    // Customer and order details
    customer_id: String,
    order_date: String,
    total_amount: Number,
    status: String,
    payment_status: String,
    coupon_code: String,

    // Shipping and tracking information
    shipping_info: {
        shipping_address: String,
        shipping_provider: String,
        tracking_number: String,
    },
    
    // An array of items in the order (UPDATED)
    order_items: [
        {
            product_id: String,
            product_name: String,
            quantity: Number,
            price_at_purchase: Number,
            
            // --- NEW: SELECTED VARIATION FIELDS ---
            selected_size: String,   // e.g., 'M', 'XL'
            selected_color: String,  // e.g., 'Black', 'Navy'
            // --- END NEW FIELDS ---
        }
    ],

    // Timestamps
    created_at: String,
    updated_at: String,
};

module.exports = Order;