// D:\stylescapes\frontend\src\pages\ProductDetail.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getSimilarProducts } from '../api/productsApi'; 
import { getReviewsForProduct, createReview, getExistingReview, updateReview } from '../api/reviewsApi';
import { checkVerificationStatus, updateCartItem } from '../api/userApi'; 

// Import all child components
import ProductMedia from '../components/Product/ProductMedia';
import ProductOptions from '../components/Product/ProductOptions';
import ProductAccordion from '../components/Product/ProductAccordion';
import ProductReviews from '../components/Product/ProductReviews';
import ReviewFormModal from '../components/Product/ReviewFormModal';
import ProductCardSimple from '../components/Product/ProductCardSimple';

import '../styles/ProductDetail.css';

// --- Data Utility (Remains Unchanged) ---
const calculateReviewSummary = (reviews) => {
    if (reviews.length === 0) return { avg: 0, count: 0, distribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0} };

    let totalRating = 0;
    let dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
        totalRating += review.rating;
        dist[review.rating] = (dist[review.rating] || 0) + 1;
    });
    
    const avg = (totalRating / reviews.length);
    return { avg: avg, count: reviews.length, distribution: dist };
};


const ProductDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState(calculateReviewSummary([]));
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [globalNotification, setGlobalNotification] = useState(null); 
    
    const [selectedVariant, setSelectedVariant] = useState({ color: null, size: null, quantity: 1 }); 
    const [isVerifiedPurchaser, setIsVerifiedPurchaser] = useState(false); 
    const [existingReview, setExistingReview] = useState(null); 
    
    const [relatedProducts, setRelatedProducts] = useState([]); 

    const productImages = useMemo(() => product?.images?.image_url 
        ? [
            { src: product.images.image_url }, 
            ...(product.images.additional_images || []).map(src => ({ src }))
        ]
        : [], [product]);

    // --- 1. Data Fetching (Remains Unchanged) ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        let existingUserReview = null;

        try {
            // PHASE 1: Fetch PUBLIC Data
            const [productData, reviewResponse] = await Promise.all([
                getProductById(id),
                getReviewsForProduct(id)
            ]);
            
            const reviewData = Array.isArray(reviewResponse) ? reviewResponse : [];

            // PHASE 1B: Fetch Similar Products
            const similarProductsData = await getSimilarProducts(productData.id);
            setRelatedProducts(similarProductsData); 
            
            setProduct(productData);
            setReviews(reviewData);
            setReviewSummary(calculateReviewSummary(reviewData));
            
            
            // PHASE 2: Fetch PROTECTED Data
            if (user && user.uid && token) {
                
                const [verificationResult, existingReviewResult] = await Promise.all([
                    checkVerificationStatus(id, token),
                    getExistingReview(user.uid, id, token)
                ]);

                setIsVerifiedPurchaser(verificationResult.isVerified); 
                setExistingReview(existingReviewResult);

            } else {
                setIsVerifiedPurchaser(false);
                setExistingReview(null);
            }
            
            // Initialize variants based on fetched data
            const initialColor = productData.available_colors && productData.available_colors.length > 0 ? productData.available_colors[0].name : null;
            const initialSize = productData.available_sizes && productData.available_sizes.length === 1 ? productData.available_sizes[0] : null;

            setSelectedVariant({
                color: initialColor,
                size: initialSize,
                quantity: 1
            });
            
        } catch (error) {
            console.error("CRITICAL: Failed to fetch data:", error); 
            setProduct(null); 
            setReviews([]);
            setIsVerifiedPurchaser(false);
            setExistingReview(null);
            setRelatedProducts([]); 
        } finally {
            setIsLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- 2. Handlers ---
    
    const handleVariantChange = (variant) => {
        const newColor = variant.color !== undefined ? variant.color : selectedVariant.color;
        const newSize = variant.size !== undefined ? variant.size : selectedVariant.size;
        const newQuantity = variant.quantity !== undefined ? variant.quantity : selectedVariant.quantity;


        if (newColor === selectedVariant.color && 
            newSize === selectedVariant.size &&
            newQuantity === selectedVariant.quantity
        ) {
            return;
        }

        setSelectedVariant({
            color: newColor,
            size: newSize,
            quantity: newQuantity,
        });
    };

    const handleOpenReviewModal = () => {
        setIsModalOpen(true);
    }

    const displayError = (message) => {
        setGlobalNotification(message);
        setTimeout(() => setGlobalNotification(null), 4000);
    };

    /**
     * @description Handles adding/updating the permanent cart (Standard Checkout flow).
     * @param {object} payload - Item details.
     */
    const handleUpdateCart = useCallback(async (payload) => { 
        const token = localStorage.getItem('token');
        if (!user || !token) {
            // CRITICAL REDIRECT FIX: Save the current dynamic product path before redirecting
            navigate('/auth', { state: { from: window.location.pathname } }); 
            throw new Error("Authentication required."); 
        }

        if (!product || !product.id) {
            displayError('Product data is missing.');
            return;
        }

        try {
            const itemDetails = {
                productId: product.id, 
                selectedColor: payload.selectedColor,
                selectedSize: payload.selectedSize,
                quantity: payload.quantity,
            };

            // This only handles the 'Add to Cart' API call
            const response = await updateCartItem(token, itemDetails);
            
            if(response.summary.item_count > 0) {
                // **ADD TO CART SUCCESS**
                return { success: true, message: 'Item added to cart.' };
            } else {
                throw new Error("Cart updated, but item count did not increase.");
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to add item to cart.";
            throw new Error(errorMessage); 
        }
    }, [user, product, navigate, displayError]); 


    const handleReviewSubmit = async (reviewData) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const isEditing = !!existingReview;
        
        const payload = { ...reviewData, productId: id, isVerified: isVerifiedPurchaser };
        
        // Optimistic UI Update: 
        const newReview = { 
            id: isEditing ? existingReview.id : Date.now(), 
            date: new Date().toLocaleDateString(),
            name: reviewData.reviewerName,
            rating: reviewData.rating,
            comment: reviewData.comment,
            isVerified: isVerifiedPurchaser, 
            isPending: false 
        };

        setReviews(prevReviews => {
            if (isEditing) {
                return prevReviews.map(r => r.id === newReview.id ? newReview : r);
            }
            return [...prevReviews, newReview];
        });
        setReviewSummary(calculateReviewSummary([...reviews, newReview]));
        setIsModalOpen(false);

        try {
            if (isEditing) {
                await updateReview(existingReview.id, payload, token);
                console.warn(`[ADMIN ALERT] Review ID ${existingReview.id} UPDATED and published.`);
            } else {
                await createReview(payload, token);
                console.warn(`[ADMIN ALERT] New review PUBLISHED for Product ${id}. Requires moderation.`);
            }
            
            if (user && user.uid && token) {
                 const updatedExistingReview = await getExistingReview(user.uid, id, token);
                 setExistingReview(updatedExistingReview);
            }

        } catch (error) {
            // Roll back the optimistic update
            fetchData(); 
            console.error("Review submission failed:", error);
            alert(`Review ${isEditing ? 'update' : 'submission'} failed. Please try again.`);
        }
    };
    
    // Helper to render stars (used in header)
    const renderStars = (rating) => {
        const fullStars = '★'.repeat(Math.floor(rating));
        const emptyStars = '☆'.repeat(5 - Math.floor(rating));
        return `${fullStars}${emptyStars}`;
    };

    // --- 3. Loading/Error States ---
    if (isLoading) {
        return <div className="loading-state">Loading product details...</div>;
    }

    if (!product) {
        return <div className="error-state">Product not found.</div>;
    }
    
    // Price Calculation for UI
    const mainPrice = product.price?.sale_price || product.price?.base_price || 0;
    const originalPrice = product.price?.base_price;
    const isOnSale = mainPrice < originalPrice;
    const discountPercentage = isOnSale ? Math.round(((originalPrice - mainPrice) / originalPrice) * 100) : 0;
    
    // relatedProducts now uses the state set in fetchData


    // --- 4. Main Render ---
    return (
        <div className="main-container">
            
            {/* Review Form Modal */}
            <ReviewFormModal
                productId={id}
                userId={user?.uid} 
                isModalOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmitReview={handleReviewSubmit}
                existingReview={existingReview}
                isVerifiedPurchaser={isVerifiedPurchaser} 
            />

            {/* Global Error Notification */}
            {globalNotification && (
                 <div className="wishlist-notification" style={{ background: '#e74c3c', bottom: '20px', left: '20px' }}>
                    <span className="notification-message">{globalNotification}</span>
                </div>
            )}

            {/* LEFT COLUMN: Product Media Viewer */}
            <div className="product-media">
                <ProductMedia 
                    productImages={productImages} 
                />
            </div>
            
            {/* RIGHT COLUMN: Details, Options, Accordion */}
            <div className="product-details">
                
                {/* Product Header (Title, Price, Description) */}
                <div>
                    <h1 className="product-name">{product.product_name}</h1>
                    <p className="product-brand">BY {product.brand || 'STYLESCAPES'}</p>
                    <div className="product-rating-summary">
                        <span className="stars-display">{renderStars(reviewSummary.avg)}</span>
                        <span className="rating-text-summary">({reviewSummary.count} reviews)</span>
                    </div>
                    
                    {/* Discount UI Integration */}
                    <div className="product-price-block">
                        <span className="price-value">₹{mainPrice.toLocaleString('en-IN')}</span>
                        {isOnSale && (
                            <>
                                <span className="price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
                                <span className="discount-percentage">
                                    {discountPercentage}% OFF
                                </span>
                            </>
                        )}
                    </div>
                    
                    <p className="product-description">
                        {product.short_description || product.description}
                    </p>
                </div>
                
                {/* Product Options & CTA */}
                <div className="section-divider">
                    {/* CRITICAL FIX: Pass the whole 'product' object to enable stock check */}
                    {product && (
                        <ProductOptions
                            product={product} 
                            onSelectVariation={handleVariantChange}
                            // CRITICAL: Passed the 'Add to Cart' handler only
                            onAddToCart={handleUpdateCart} 
                            initialSelectedVariant={selectedVariant}
                        />
                    )}
                </div>
                
                {/* Product Accordion (Description, Shipping, Reviews) */}
                <div className="accordion-wrapper">
                    <ProductAccordion
                        productData={product}
                        reviewContent={
                            <ProductReviews 
                                reviews={reviews} 
                                summary={reviewSummary}
                                onAddReviewClick={handleOpenReviewModal}
                                user={user} 
                                isVerifiedPurchaser={isVerifiedPurchaser} 
                                hasExistingReview={!!existingReview} 
                            />
                        }
                    />
                </div>
            </div>
            
            {/* RELATED PRODUCTS ROW (Vertical Grid) */}
            <div className="related-products-section">
                <h2 className="related-products-title">Similar Products</h2> 
                
                <div className="related-products-grid">
                    {relatedProducts.map(p => (
                        <ProductCardSimple 
                            key={p.id} 
                            product={p} 
                            onClick={() => navigate(`/product/${p.id}`)}
                        />
                    )) || null} 
                </div>
            </div>
            
        </div>
    );
};

export default ProductDetail;