// D:\stylescapes\backend\src\services\reviewService.js

const { db } = require('../config/firebase');

/**
 * @description Retrieves all PUBLISHED reviews for a specific product from Firestore.
 */
exports.getReviewsForProduct = async (productId) => {
    try {
        const reviewsQuerySnapshot = await db.collection('reviews')
            // FIX: Query using the correct field name 'productId' (camelCase) from the model/DB.
            .where('productId', '==', productId) 
            .where('status', '==', 'published') 
            .get();
        
        const reviews = reviewsQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            // Map 'isVerified' field from the DB document for the frontend.
            isVerified: doc.data().isVerified, 
            ...doc.data()
        }));
        return reviews;
    } catch (error) {
        console.error("Error in getReviewsForProduct:", error);
        throw new Error('Failed to retrieve reviews.');
    }
};

/**
 * @description Adds a new review to Firestore.
 */
exports.addReview = async (userId, reviewData) => {
    try {
        const newReview = {
            // CRITICAL: Ensure fields like 'userId' and 'isVerified' are correctly persisted.
            productId: reviewData.productId, 
            comment: reviewData.comment,
            rating: reviewData.rating,
            reviewerName: reviewData.reviewerName,

            userId: userId, // Use the authenticated user ID
            isVerified: reviewData.isVerified || false, 
            status: 'published',
            created_at: new Date().toISOString(),
        };
        
        const docRef = await db.collection('reviews').add(newReview);
        return { id: docRef.id, ...newReview };
    } catch (error) {
        console.error("Error in addReview:", error);
        throw new Error('Failed to add review.');
    }
};

/**
 * @description Checks if a user has already submitted a review for a product (Limiter/Edit UX).
 */
exports.getExistingReview = async (userId, productId) => {
    try {
        const reviewSnap = await db.collection('reviews')
            // FIX: Query using the correct field names 'userId' and 'productId' (camelCase).
            .where('userId', '==', userId) 
            .where('productId', '==', productId) 
            .limit(1)
            .get();

        if (reviewSnap.empty) {
            return null;
        }

        const doc = reviewSnap.docs[0];
        return { id: doc.id, ...doc.data() };
        
    } catch (error) {
        console.error("Error checking existing review:", error);
        return null;
    }
};

/**
 * @description Updates an existing review (Edit flow).
 */
exports.updateReview = async (reviewId, userId, updateData) => {
    try {
        const reviewRef = db.collection('reviews').doc(reviewId);
        
        // Ensure the user trying to update owns the review
        const reviewSnap = await reviewRef.get();
        if (!reviewSnap.exists || reviewSnap.data().userId !== userId) {
            throw new Error('Unauthorized or Review not found for update.');
        }

        await reviewRef.update({
            // Update only specific fields needed for an edit
            rating: updateData.rating,
            comment: updateData.comment,
            reviewerName: updateData.reviewerName,
            updated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating review:", error);
        throw new Error('Failed to update review.');
    }
};


/**
 * @description Deletes a review by its ID.
 * NOTE: Logic adjusted to use corrected field names (userId).
 */
exports.deleteReview = async (reviewId, userId, userRole) => {
    try {
        const reviewRef = db.collection('reviews').doc(reviewId);
        const reviewSnap = await reviewRef.get();

        if (!reviewSnap.exists) {
            throw new Error('Review not found.');
        }
        
        const reviewData = reviewSnap.data();

        if (reviewData.userId === userId || userRole === 'admin') {
            await reviewRef.delete();
        } else {
            throw new Error('You do not have permission to delete this review.');
        }
    } catch (error) {
        console.error("Error in deleteReview:", error);
        throw error;
    }
};