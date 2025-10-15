// D:\stylescapes\frontend\src\components\Product\ProductCardSimple.js

import React from 'react';
import '../../styles/ProductCardSimple.css'; 

const ProductCardSimple = ({ product, onClick }) => {
    
    // Default data structure expectation (matching backend model)
    const name = product.product_name || "New Product";
    const imageUrl = product.images?.image_url || "https://placehold.co/240x190/1a1a1a/a0a0a0?text=Product";
    const discountedPrice = product.price?.sale_price || product.price?.base_price || 0;
    const basePrice = product.price?.base_price;
    const rating = product.rating || 4.5;
    const ratingCount = product.rating_count || 12;
    
    const isOnSale = discountedPrice < basePrice;
    
    // Helper to render stars (using basic string for simplicity)
    const renderStars = (rating) => {
        const fullStars = '★'.repeat(Math.floor(rating));
        const emptyStars = '☆'.repeat(5 - Math.floor(rating));
        return `${fullStars}${emptyStars}`;
    };

    // Calculate discount percentage for the badge
    const calculateDiscount = (base, sale) => {
        if (!base || !sale || base <= sale) return null;
        return Math.round(((base - sale) / base) * 100);
    };

    const discountPercentage = calculateDiscount(basePrice, discountedPrice);

    const handleCardClick = (e) => {
        // In React, you'd usually pass the product ID or slug for navigation
        if (onClick) {
            onClick(product.id || product.uid);
        }
    };

    return (
        <div 
            className="product-card-simple" 
            onClick={handleCardClick}
            tabIndex="0" 
            role="button" 
            aria-label={`View details for ${name}`}
        >
            {isOnSale && discountPercentage && (
                <span className="simple-discount-badge">{discountPercentage}% OFF</span>
            )}
            
            <div className="simple-image-wrapper">
                <img 
                    src={imageUrl} 
                    alt={name} 
                    className="simple-product-image" 
                    loading="lazy"
                />
            </div>
            
            <div className="simple-product-info">
                <div className="simple-product-header">
                    {/* Ellipsis truncation applied via CSS */}
                    <h3 className="simple-product-name">{name}</h3>
                    
                    <div className="simple-product-meta">
                        <p className="simple-product-price">₹{discountedPrice.toLocaleString('en-IN')}</p>
                        {isOnSale && (
                            <span className="simple-price-original">₹{basePrice.toLocaleString('en-IN')}</span>
                        )}
                    </div>
                </div>
                
                <div className="simple-rating-block" aria-label={`Rating ${rating.toFixed(1)} out of 5`}>
                    <span className="simple-stars" aria-hidden="true">{renderStars(rating)}</span>
                    <span className="simple-rating-text">({rating.toFixed(1)})</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCardSimple;