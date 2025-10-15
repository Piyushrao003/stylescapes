// D:\stylescapes\frontend\src\components\Product\ProductReviews.js

import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/ProductReviews.css';

const REVIEWS_PER_LOAD = 5;

// --- Helper Functions ---

const getStars = (rating) => {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += `<span class="star-icon">${i < rating ? '★' : '☆'}</span>`;
    }
    return stars;
};

const getVerifiedBadge = (isVerified) => {
    if (!isVerified) return null;
    return (
        <span className="verified-badge">
            <span className="check-icon">✓</span>
            <span className="badge-text">Verified Purchase</span>
        </span>
    );
};

// --- React Component ---

const ProductReviews = ({ reviews = [], summary, onAddReviewClick, user, isVerifiedPurchaser }) => { 
    
    const [filteredReviews, setFilteredReviews] = useState(reviews);
    const [reviewsLoadedCount, setReviewsLoadedCount] = useState(REVIEWS_PER_LOAD);
    const [activeFilter, setActiveFilter] = useState(0); 
    
    const reviewSummary = summary || { avg: 0, count: 0, distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0} };

    // --- Filtering Logic ---
    const applyFilter = useCallback((rating) => {
        setActiveFilter(rating);
        setReviewsLoadedCount(REVIEWS_PER_LOAD); 
        
        if (rating === 0) {
            setFilteredReviews(reviews);
        } else {
            setFilteredReviews(reviews.filter(r => r.rating === rating));
        }
    }, [reviews]);

    // Effect: Updates internal state when external 'reviews' prop changes (e.g., after submission)
    useEffect(() => {
        setReviewsLoadedCount(REVIEWS_PER_LOAD); 
        applyFilter(activeFilter); 
    }, [reviews, activeFilter, applyFilter]); 

    // --- Load More Handler ---
    const loadMoreReviews = () => {
        setReviewsLoadedCount(prevCount => prevCount + REVIEWS_PER_LOAD);
    };

    // --- CRITICAL: Login Check Handler ---
    const handleWriteReviewClick = () => {
        if (!user || !user.uid) { 
            alert("Please log in to share your review.");
            return;
        }
        // If logged in, proceed to open the modal (passed from parent)
        onAddReviewClick();
    };

    // --- JSX Rendering Helpers ---

    const renderDistributionBars = () => {
        const total = reviewSummary.count;
        return [5, 4, 3, 2, 1].map(rating => {
            const count = reviewSummary.distribution[rating] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
                <div key={rating} className="rating-bar-row">
                    <span className="stars">{rating}</span>
                    <div className="bar-container">
                        <div className="fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="count">{count}</span>
                </div>
            );
        });
    };

    // 1. Determine Button Status Message and Guidance
    let buttonMessage = 'Log In to Write a Review';
    let reviewGuidance = null;
    let buttonDisabled = true;
    
    if (user && user.uid) {
        buttonDisabled = false;
        
        if (isVerifiedPurchaser) {
            // SCENARIO 1: User is Verified
            buttonMessage = 'Write a Review (Will be Verified)';
            reviewGuidance = (
                <p className="review-guidance verified-guidance">
                    Your review will be published immediately and receive the <strong style={{fontWeight: 700}}>Verified Purchase</strong> badge.
                </p>
            );
        } else {
            // SCENARIO 2: User is Logged In but NOT Verified
            buttonMessage = 'Write a Review (Not Verified)';
            reviewGuidance = (
                <p className="review-guidance unverified-guidance">
                    Your review will be published immediately, but will **not** include the Verified Purchase badge.
                </p>
            );
        }
    }


    const reviewsToDisplay = filteredReviews.slice(0, reviewsLoadedCount);
    
    return (
        <div className="reviews-container">
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Customer Reviews</h2> 
            
            <div className="review-header-section">
                
                {/* Review Summary Block */}
                <div className="review-summary">
                    <div className="overall-rating-block">
                        <div className="overall-rating">{reviewSummary.avg.toFixed(1)}</div>
                        <div className="overall-stars" dangerouslySetInnerHTML={{ __html: getStars(Math.round(reviewSummary.avg)) }} />
                        <span className="total-reviews-count">({reviewSummary.count} total ratings)</span>
                    </div>

                    {/* Star Distribution Bars */}
                    <div className="star-distribution">
                        {renderDistributionBars()}
                    </div>
                </div>
                
                {/* Star Filter Bar */}
                <div className="star-filter-bar">
                    {[0, 5, 4, 3, 2, 1].map((rating) => (
                        <button 
                            key={rating}
                            className={`filter-button ${activeFilter === rating ? 'active' : ''}`}
                            onClick={() => applyFilter(rating)}
                            data-rating={rating}
                        >
                            {rating === 0 ? 'All Reviews' : (
                                <>
                                    <span className="star-icon">★</span> {rating} Star{rating !== 1 ? 's' : ''}
                                </>
                            )}
                        </button>
                    ))}
                </div>
                
                {/* NEW: Guidance Message Box */}
                {reviewGuidance && <div className="review-guidance-box">{reviewGuidance}</div>}

                {/* "Write a Review" button with login check and dynamic text */}
                <button className="add-review-btn" onClick={handleWriteReviewClick} disabled={buttonDisabled}>
                    <span>+</span>
                    <span>{buttonMessage}</span>
                </button>
            </div>

            {/* Individual Review List */}
            <div className="review-list-container">
                <div className="review-list" id="reviewList">
                    {reviewsToDisplay.length === 0 ? (
                        <p className="no-reviews-message">No reviews found for this selection.</p>
                    ) : (
                        reviewsToDisplay.map((review, index) => (
                            <div 
                                key={review.id}
                                className="individual-review" 
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="reviewer-info-line">
                                    <div className="reviewer-details">
                                        <span className="reviewer-name">{review.name}</span>
                                        {getVerifiedBadge(review.isVerified)}
                                    </div>
                                    <span className="review-date">{review.date}</span>
                                </div>
                                <span className="review-stars" dangerouslySetInnerHTML={{ __html: getStars(review.rating) }} />
                                <p className="review-title">{review.title}</p>
                                <p className="review-text">{review.comment}</p>
                                
                                {review.isPending && (
                                    <p style={{ color: 'var(--gold-accent)', fontSize: '0.9rem', marginTop: '10px' }}>
                                        (Pending Admin Verification)
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
                
                {/* Load More Button */}
                {reviewsLoadedCount < filteredReviews.length && (
                    <div className="load-more-container">
                        <button className="btn-read-more" onClick={loadMoreReviews}>
                            Load More Reviews ({filteredReviews.length - reviewsLoadedCount} left)
                        </button>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default ProductReviews;