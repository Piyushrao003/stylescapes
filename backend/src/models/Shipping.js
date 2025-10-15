// D:\stylescapes\backend\src\models\Shipping.js

const Shipping = {
    // Unique ID from Firestore
    method_id: String,
    
    // Shipping method details
    method_name: String,        // e.g., 'Standard Delivery', 'Express Shipping'
    
    // An array of shipping zones with their prices and times
    shipping_zones: [
        {
            zone_name: String,      // e.g., 'Inside 1000km', 'Outside India'
            charges: Number,        // The cost in Rupees
            delivery_time: Number,  // The time in days
        }
    ],

    is_active: Boolean,         // A flag to enable/disable the method
    
    // Timestamps
    created_at: String,
    updated_at: String,
};

module.exports = Shipping;
