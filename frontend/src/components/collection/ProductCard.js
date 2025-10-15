// D:\stylescapes\frontend\src\components\Collection\ProductCard.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Ensure CSS is imported
import '../../styles/ProductCard.css'; 
// Import the assumed API function for user data updates
import { updateUserWishlist } from '../../api/userApi'; 

// --- Helper Functions (Pure JavaScript) ---

// Helper function to format price
const formatPrice = (price) => {
    if (typeof price !== 'number') return 'N/A';
    return `₹${price.toLocaleString('en-IN')}`;
};

// Helper function to render star icons
const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - Math.ceil(rating);
    
    let stars = [];
    for (let i = 0; i < fullStars; i++) {
        stars.push(<span key={`full-${i}`} className="star">★</span>);
    }
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    return stars;
};

// --- ProductCard Component ---

const ProductCard = ({ product, user, className }) => {
    // State initialization relies on prop data structure from backend
    const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted || false);
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const navigate = useNavigate();

    // --- Data Mapping ---
    const name = product.product_name || "StyleScapes Item";
    const imageUrl = product.images?.image_url || "https://placehold.co/400x560/2a2a2a/d4a574?text=StyleScapes";
    const basePrice = product.price?.base_price || 4999;
    const salePrice = product.price?.sale_price;
    const isOnSale = product.price?.is_on_sale || (salePrice && salePrice < basePrice);
    const rating = product.rating || 4.5;
    const ratingCount = product.rating_count || 120;
    
    const displayedPrice = isOnSale ? salePrice : basePrice;

    // --- Wishlist & Auth Handler (The Core Logic) ---
    const handleWishlistToggle = async (e) => {
        e.stopPropagation();
        e.preventDefault(); 
        
        // 1. Check Primary Auth State (User prop stability)
        if (!user) {
            console.log("Authentication required. Redirecting to /auth.");
            // Send user to login, preserving their current location for redirection back
            navigate('/auth', { state: { from: window.location.pathname } });
            return;
        }

        // 2. Check Auth Token (Required for API call)
        const token = localStorage.getItem('token'); 
        if (!token) {
            // Should rarely happen if 'user' is truthy, but handles token expiration/deletion
            console.error("Token missing for logged-in user. Forcing relogin.");
            navigate('/auth'); 
            return;
        }

        const action = isWishlisted ? 'remove' : 'add';
        const successMessage = isWishlisted ? "Item removed from Wishlist" : "Item added to Wishlist";

        try {
            // 3. Execute API Call
            const response = await updateUserWishlist(user.uid, product.id, token, action);
            
            if (response.success) {
                // 4. Update local state and show notification on success
                setIsWishlisted(prev => !prev);
                setNotificationMessage(successMessage);
                setNotificationVisible(true);
                
                // Hide notification after 3 seconds
                setTimeout(() => setNotificationVisible(false), 3000); 
            } else {
                 // Handle specific API error if response.success is false
                 console.error("Wishlist API failed:", response.error);
            }
        } catch (error) {
            console.error(`Error processing wishlist action (${action}):`, error);
        }
    };
    
    // Handler for navigating to the product detail page
    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };


    // --- JSX Structure ---
    return (
        <>
            <div 
                className={`card ${className || ''}`}
                onClick={handleCardClick}
                data-category={product.category || 'clothing'} 
                data-price={displayedPrice} 
                data-rating={rating}
                data-date={product.created_at || new Date().toISOString()}
            >
                <div className="card-inner">
                    {/* Product Badges */}
                    {isOnSale && <div className="product-badge sale">Sale</div>}
                    {product.isNew && <div className="product-badge">New</div>}
                    
                    {/* Wishlist Button */}
                    <button 
                        className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} 
                        onClick={handleWishlistToggle} 
                        aria-label="Toggle wishlist"
                    >
                        {/* SVG Heart Icon */}
                        <svg className="heart-icon" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </button>
                    
                    {/* Image Wrapper for 3D Effect */}
                    <div className="wrapper">
                        <img 
                            src={imageUrl} 
                            className="cover-image" 
                            alt={name} 
                            // CRITICAL CHANGE: Implement Native Lazy Loading
                            loading="lazy" 
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x560/2a2a2a/d4a574?text=StyleScapes"; }}
                        />
                    </div>
                    
                    {/* Product Info */}
                    <div className="product-info">
                        <h3>{name}</h3>
                        <div className="product-rating">
                            {renderStars(rating)}
                            <span className="rating-count">({ratingCount})</span>
                        </div>
                        <div className="price">
                            {formatPrice(displayedPrice)}
                            {isOnSale && (
                                <span className="original-price">{formatPrice(basePrice)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Popup (Must be styled for bottom-left positioning) */}
            {notificationVisible && (
                <div className="wishlist-notification">
                    <span className="notification-message">{notificationMessage}</span>
                </div>
            )}
        </>
    );
};

export default ProductCard;