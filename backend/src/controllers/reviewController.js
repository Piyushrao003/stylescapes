// D:\stylescapes\backend\src\controllers\reviewController.js

const reviewService = require('../services/reviewService');
const { verifyUser } = require('../middleware/authMiddleware');
const { db } = require('../config/firebase');

/**
 * @description GET /api/reviews/:productId/reviews - Public route to get all reviews for a product.
 */
exports.getReviewsByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewService.getReviewsForProduct(productId);
        res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @description POST /api/reviews - Protected route for users to create a new review.
 */
exports.createReview = async (req, res) => {
    try {
        const userId = req.user.uid;
        const reviewData = req.body;
        
        // This relies on reviewData containing isVerified (from frontend check)
        const newReview = await reviewService.addReview(userId, reviewData); 
        
        console.log(`Review submitted and published by user ${userId}. Status: Published. Awaiting post-moderation.`);

        res.status(201).json({ message: 'Review submitted and published successfully', review: newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @description GET /api/reviews/user-review/:productId - Protected route to check if a user has reviewed a product.
 */
exports.getExistingUserReview = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { productId } = req.params;
        
        const existingReview = await reviewService.getExistingReview(userId, productId);
        
        if (existingReview) {
            res.status(200).json(existingReview);
        } else {
            // Returns 404 which the frontend interprets as 'Write a Review' state
            res.status(404).json({ message: 'No existing review found for this product by this user.' });
        }
    } catch (error) {
        console.error("Error checking existing user review:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @description PUT /api/reviews/:id - Protected route to update an existing review.
 */
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const updateData = req.body;

        await reviewService.updateReview(id, userId, updateData);
        
        res.status(200).json({ message: 'Review updated successfully', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @description DELETE /api/reviews/:id - Protected route to delete a review.
 */
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const userRole = req.user.role;
        await reviewService.deleteReview(id, userId, userRole);
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};