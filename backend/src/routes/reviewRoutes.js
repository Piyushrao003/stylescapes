// D:\stylescapes\backend\src\routes\reviewsRoutes.js

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyUser } = require('../middleware/authMiddleware');

// 1. Public route to get all reviews for a specific product
// Endpoint: GET /api/reviews/:productId/reviews
router.get('/:productId/reviews', reviewController.getReviewsByProductId);

// 2. Protected route to check if a user has an existing review for the product (Limiter/Edit UX)
// Endpoint: GET /api/reviews/user-review/:productId
router.get('/user-review/:productId', verifyUser, reviewController.getExistingUserReview);

// 3. Protected route for users to create a new review
// Endpoint: POST /api/reviews
router.post('/', verifyUser, reviewController.createReview);

// 4. NEW: Protected route to update an existing review (Edit flow)
// Endpoint: PUT /api/reviews/:id
router.put('/:id', verifyUser, reviewController.updateReview);

// 5. Protected route to delete a review
// Endpoint: DELETE /api/reviews/:id
router.delete('/:id', verifyUser, reviewController.deleteReview);

module.exports = router;