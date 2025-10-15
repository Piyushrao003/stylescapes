// frontend/src/components/Account/WishlistManager.js

import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/WishlistManager.css';
// Import necessary APIs
import { getUserProfile, updateUserWishlist, updateCartItem } from '../../api/userApi';
import { getProductById } from '../../api/productsApi'; 
// NOTE: ProductCard component import is not needed as the JSX is defined here.

const WishlistManager = ({ user, onUserUpdateSuccess }) => {
    
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');
    
    // --- Data Fetching Logic: Step 2 - Fetch Product Details ---
    const fetchWishlistDetails = useCallback(async (wishlistIds) => {
        if (!wishlistIds || wishlistIds.length === 0) {
            setWishlistItems([]);
            return;
        }

        // Fetch detailed product data for all IDs simultaneously
        const fetchPromises = wishlistIds.map(id => getProductById(id));
        
        try {
            const productDetails = await Promise.all(fetchPromises);
            
            // Filter out null/missing products and set local state
            const validItems = productDetails.filter(p => p && p.id);
            setWishlistItems(validItems);
        } catch (err) {
            setError('Failed to fetch detailed product information for your wishlist.');
            setWishlistItems([]);
        }
    }, []);

    // --- Data Fetching Logic: Step 1 - Load Initial Data from User Profile ---
    const loadInitialData = useCallback(async () => {
        if (!user || !token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // Fetch the user's current profile which includes the wishlist array (of product IDs)
            const profile = await getUserProfile(token);
            
            if (profile.wishlist && profile.wishlist.length > 0) {
                // Pass the array of IDs to the detail fetcher
                await fetchWishlistDetails(profile.wishlist);
            } else {
                setWishlistItems([]);
            }
        } catch (err) {
            console.error("Wishlist load error:", err);
            setError("Could not load wishlist. Please check your connection or log in again.");
        } finally {
            setIsLoading(false);
        }
    }, [user, token, fetchWishlistDetails]);


    useEffect(() => {
        // Trigger data load on mount or when user/token changes
        loadInitialData();
    }, [loadInitialData]);


    // --- Action Handler: Remove from Wishlist (Persisted to Backend) ---
    const handleRemoveFromWishlist = async (productId) => {
        if (!user || !token || isLoading) return;
        if (!window.confirm("Are you sure you want to remove this item from your wishlist?")) return;

        setIsLoading(true);
        setError(null);
        try {
            // API call to remove the product ID
            const response = await updateUserWishlist(user.uid, productId, token, 'remove');
            
            // Update local component state and trigger global refresh
            setWishlistItems(prev => prev.filter(p => p.id !== productId));
            if (onUserUpdateSuccess) {
                 // Pass the updated wishlist array from the response back to global state
                 onUserUpdateSuccess({ wishlist: response.wishlist });
            }
            

        } catch (err) {
            console.error("Remove Wishlist Error:", err);
            setError(err.message || "Failed to remove item from wishlist.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Action Handler: Add to Cart (Handles Variant Logic + Removal) ---
    const handleAddToCart = async (product) => {
        if (!user || !token || isLoading) return;

        // CRITICAL: Variant Selection Logic (Assumes first available variant for simplicity)
        const firstColor = product.available_colors?.[0]?.name;
        const firstSize = product.available_sizes?.[0];
        
        if (!firstColor || !firstSize) {
           
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
             const itemDetails = {
                productId: product.id,
                selectedColor: firstColor, 
                selectedSize: firstSize, 
                quantity: 1,
            };
            
            // 1. API call to add to cart (backend handles stock check)
            await updateCartItem(token, itemDetails); 
            
            // 2. Success: Remove item from wishlist (common UX pattern)
            await handleRemoveFromWishlist(product.id);
            
           
        } catch (err) {
            console.error("Add to Cart Error:", err);
            // Error handling shows specific message from backend (e.g., "Insufficient stock")
            setError(err.response?.data?.message || "Failed to add item to cart. Check stock/variants.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- Render ---
    if (isLoading) {
        // Use the existing loading class name
        return <div className="wlm-loading-state">Loading wishlist...</div>;
    }

    return (
        <div className="wlm-content-section wlm-active" id="wishlist">
            <h2 className="wlm-section-title">My Wishlist ({wishlistItems.length})</h2>
            
            {error && <p style={{ color: 'var(--danger-color)', marginBottom: '1rem', fontWeight: 600 }}>Error: {error}</p>}
            
            {wishlistItems.length === 0 ? (
                // Empty State
                <div className="wlm-empty-state">
                    <p>Your wishlist is empty. Start browsing our collection!</p>
                    <a href="/collections" className="wlm-btn-browse">Explore Styles</a>
                </div>
            ) : (
                // Wishlist Grid
                <div className="wlm-wishlist-grid">
                    {wishlistItems.map((product) => (
                        <div className="wlm-wishlist-item" key={product.id}>
                            <div className="wlm-wishlist-item-image-wrapper">
                                <img 
                                    src={product.images?.image_url} 
                                    alt={product.product_name} 
                                    className="wlm-wishlist-item-image"
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/1a1a1a/a0a0a0?text=Product"; }}
                                />
                            </div>
                            <div className="wlm-wishlist-item-content">
                                <h3 className="wlm-wishlist-item-title">{product.product_name}</h3>
                                <div className="wlm-wishlist-item-price">
                                    {/* Safely access sale_price or fallback to base_price */}
                                    ₹{(product.price?.sale_price || product.price?.base_price)?.toLocaleString('en-IN')}
                                </div>
                                <div className="wlm-wishlist-item-actions">
                                    <button 
                                        className="wlm-btn-small wlm-btn-primary"
                                        onClick={() => handleAddToCart(product)}
                                        disabled={isLoading}
                                    >
                                        Add to Cart
                                    </button>
                                    <button 
                                        className="wlm-btn-small wlm-btn-danger"
                                        onClick={() => handleRemoveFromWishlist(product.id)}
                                        disabled={isLoading}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistManager;