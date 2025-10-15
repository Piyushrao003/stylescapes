// D:\stylescapes\backend\src\models\Transaction.js

const Transaction = {
    // Unique ID from Firestore
    transaction_id: String,
    
    // Foreign Key to link the transaction to an order
    order_id: String,
    
    // Transaction details
    payment_gateway_id: String, // The ID from the payment provider (e.g., Stripe, Razorpay)
    amount: Number,
    currency: String,           // e.g., 'INR'
    status: String,             // e.g., 'success', 'failed', 'pending'
    
    // Timestamps
    created_at: String,
    last_updated: String,
};

module.exports = Transaction;