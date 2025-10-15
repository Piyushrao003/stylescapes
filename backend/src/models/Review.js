// D:\stylescapes\backend\src\models\Review.js

const Review = {
    // Unique ID from Firestore
    review_id: String,
    
    // Foreign Keys to link the review
    order_id: String,     
    
    // CRITICAL FIXES: Match DB/Frontend Naming
    productId: String,      // The product being reviewed (matches DB camelCase)
    userId: String,         // The user who created the review (matches DB camelCase)
    
    // Review content
    rating: Number,       
    title: String,        
    comment: String,      
    
    // Verification and Status Fields
    isVerified: Boolean,    // True if user had a verified purchase (matches DB camelCase)
    status: String,         // e.g., 'published', 'pending', 'rejected'
    
    // Timestamps
    created_at: String,
    updated_at: String,
};

module.exports = Review;