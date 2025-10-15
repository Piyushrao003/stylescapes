// D:\stylescapes\backend\src\models\Report.js

/**
 * @description Generates a unique Support Ticket (STSC) ID.
 * Format: STSC-XXXXXX (where XXXXXX is a 6-digit hex string)
 * @returns {string} The unique STSC ID.
 */
const generateStscId = () => {
    // Generate a 6-digit random hexadecimal string (16^6 = 16,777,216 possibilities)
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
    return `STSC-${hex}`;
};

const Report = {
    // Primary Key: The unique ticket identifier
    ticket_id: String, // Will be generated using generateStscId()

    // 1. Classification
    type: String, // 'CUSTOMER_COMPLAINT' | 'REVIEW_REPORT' | 'ADMIN_METRIC'
    category: String, // 'SHIPPING' | 'PAYMENT' | 'PRODUCT' | 'STOCK_LOW' | 'API_LATENCY' | 'CART_ABANDONMENT' | 'OTHER'
    
    // 2. Status & Resolution
    status: String, // 'OPEN' | 'PENDING' | 'CLOSED' | 'RESOLVED'
    priority: String, // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    
    // 3. Foreign Keys (Links to related data)
    user_id: String, // UID of the reporter or the user affected (optional for system alerts)
    related_id: String, // ID of the relevant Product, Order, or Review (optional)

    // 4. Content
    subject: String, // Concise summary of the issue
    description: String, // Detailed body of the report/complaint

    // 5. Structured Data for Metrics (Only used when type === 'ADMIN_METRIC')
    data_payload: {
        current_value: Number, // E.g., Stock level, API latency (ms)
        threshold: Number,     // E.g., The limit that was crossed (for alert type)
        details: Object,       // E.g., Payment gateway error codes, Abandoned cart value
    },
    
    // 6. Timestamps
    created_at: String,
    updated_at: String,
};

// Export the model structure and the utility ID generator
module.exports = { Report, generateStscId };
