// D:\stylescapes\frontend\src\components\Product\ReviewFormModal.js

import React, { useState, useRef, useEffect } from 'react';
import '../../styles/ReviewFormModal.css';

// --- SIMULATION DATA (To be replaced by actual props/auth context) ---
// Note: This logic simulates the parent component checking if the user is verified.
const SIMULATED_IS_VERIFIED_PURCHASE = false; 

const ReviewFormModal = ({ productId, userId, isModalOpen, onClose, onSubmitReview }) => {
    
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewerName, setReviewerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const modalRef = useRef(null);

    // --- State and Lifecycle Management ---
    
    useEffect(() => {
        if (isModalOpen) {
            setReviewerName(''); 
            setReviewText('');
            setRating(0);
            setError('');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
             document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

    const handleOverlayClick = (e) => {
        if (modalRef.current && e.target === modalRef.current) {
            onClose();
        }
    };
    
    // --- Star Rating Logic ---
    const handleStarClick = (newRating) => {
        setRating(newRating);
        setError('');
        // This is where the 'active' class is applied on click
        const starsContainer = document.getElementById('starRating');
        if (starsContainer) {
            starsContainer.childNodes.forEach((star, index) => {
                if (index + 1 <= newRating) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    data-rating={i}
                    // Initial rendering check for active state
                    className={i <= rating ? 'active' : ''} 
                    onClick={() => handleStarClick(i)}
                    onMouseEnter={(e) => {
                        // Logic to change color on hover (up to current star)
                        e.currentTarget.parentNode.childNodes.forEach((star, index) => {
                            if (index + 1 <= i) {
                                star.style.color = 'var(--gold-accent)';
                            } else if (!star.classList.contains('active')) {
                                star.style.color = 'var(--card-border)';
                            }
                        });
                    }}
                    onMouseLeave={(e) => {
                        // Logic to restore color on hover end
                        e.currentTarget.parentNode.childNodes.forEach((star) => {
                            if (!star.classList.contains('active')) {
                                star.style.color = '';
                            }
                        });
                    }}
                >
                    ★
                </span>
            );
        }
        return stars;
    };
    
    // --- Submission Logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (reviewText.trim().length < 20) {
            setError('Review must be at least 20 characters long.');
            return;
        }

        setIsLoading(true);

        const reviewPayload = {
            productId,
            userId: userId || 'anonymous',
            rating,
            comment: reviewText.trim(),
            reviewerName: reviewerName.trim() || 'Anonymous',
            // CRITICAL: Send the verification status for backend processing
            isVerified: SIMULATED_IS_VERIFIED_PURCHASE 
        };
        
        try {
            await onSubmitReview(reviewPayload); 
            // Parent component handles UI update and closing of modal
        } catch (err) {
            // Error is handled and alerted in the parent component
            setIsLoading(false);
        }
        
        // Final state cleanup if closure was successful
        setIsLoading(false);
        // Note: Modal closure happens in the parent after onSubmitReview
    };

    if (!isModalOpen) return null;

    return (
        <div className="review-form-modal active" ref={modalRef} onClick={handleOverlayClick}>
            <div className="review-form-container">
                <button className="close-modal" onClick={onClose} aria-label="Close modal">×</button>
                <h3>Write a Review</h3>
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label>Rating *</label>
                        <div className="star-rating-input" id="starRating">
                            {renderStars()}
                        </div>
                        {error && <p className="error-message" id="ratingError">{error}</p>}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="reviewText">Your Detailed Review *</label>
                        <textarea 
                            id="reviewText"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share what you liked, disliked, and why (min 20 characters)"
                            required
                            disabled={isLoading}
                        ></textarea>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="reviewerName">Your Name (Optional)</label>
                        <input 
                            type="text" 
                            id="reviewerName" 
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            placeholder="Displayed as reviewer name (e.g., Jane D.)"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button type="submit" className="btn-submit-review" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewFormModal;