// D:\stylescapes\backend\src\models\AdminMetric.js

/**
 * @description Defines the structured payload (data_payload) used within the 
 * 'Report' model when the type is 'ADMIN_METRIC'. This is NOT a dedicated Firestore collection.
 */
const AdminMetric = {
    // --- Shared Alert Properties ---
    priority: String, // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    
    // --- Technical / Financial Alerts ---
    // Example for 'API_LATENCY_HIGH' or 'PAYMENT_GATEWAY_FAIL'
    endpoint: String,
    latency_ms: Number,
    failure_code: String,
    
    // Example for 'CART_ABANDONMENT'
    cart_id: String,
    cart_value: Number,
    
    // --- Inventory / Sales Alerts ---
    // Example for 'STOCK_LOW' or 'SALES_FLATLINE'
    variant_id: String, // ID of the Item/Variant from the 'variants' collection
    current_value: Number, // Current stock level or sales number
    threshold: Number,     // The limit that was breached
    sales_volume: Number,  
    period: String,        // 'DAILY' | 'WEEKLY'
};

module.exports = AdminMetric;
