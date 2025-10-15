// D:\stylescapes\frontend\src\pages\CartPage.js

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/Cart/CartItem'; 
import { getCart, removeCartItem, updateCartItem, clearCart } from '../api/userApi'; 

import '../styles/Cart.css'; 

// Helper function to calculate cart totals (Remains unchanged)
const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return {
        subtotal,
        totalAmount: subtotal,
        totalItemsCount
    };
};

const CartPage = ({ user }) => {
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '', show: false });
    const navigate = useNavigate();
    const notificationTimerRef = useRef(null);

    // --- Derived State (useMemo for performance) ---
    const { subtotal, totalAmount, totalItemsCount } = useMemo(() => calculateTotals(cart), [cart]);

    // --- Utility: Show Notification (Remains unchanged) ---
    const showNotification = useCallback((message, type = 'success') => {
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }
        setNotification({ message, type, show: true });
        notificationTimerRef.current = setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000); 

    }, []);

    // --- CORE FETCH FUNCTION (Remains unchanged) ---
    const fetchCart = useCallback(async () => {
        const token = localStorage.getItem('token');
        
        // CRITICAL REDIRECT CHECK: If user or token is missing, redirect to login
        if (!user || !token) {
            setIsLoading(false);
            // Save current path (/cart) for post-login redirect
            navigate('/auth', { state: { from: '/cart' } }); 
            return;
        }

        setIsLoading(true);
        try {
            const items = await getCart(token); 
            setCart(items);
        } catch (error) {
            console.error("Cart Fetch Error:", error);
            showNotification('Failed to load cart data. Please refresh.', 'error');
            setCart([]);
        } finally {
            setIsLoading(false);
        }
    }, [user, showNotification, navigate]);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setIsLoading(false);
        }
        
        return () => {
             if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
        };
        
    }, [user, fetchCart]);

    // --- HANDLERS (API Interaction Logic) ---

    const handleUpdateQuantity = async (itemId, newQty) => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/auth', { state: { from: '/cart' } });

        setIsLoading(true);
        try {
            const existingItem = cart.find(item => item.id === itemId);
            if (!existingItem) throw new Error("Item not found in local cart.");

            const itemDetails = {
                productId: existingItem.product_id,
                selectedColor: existingItem.selected_color,
                selectedSize: existingItem.selected_size,
                quantity: newQty,
            };

            const response = await updateCartItem(token, itemDetails);
            setCart(response.items);
            showNotification(`Updated quantity to ${newQty} for ${existingItem.product_name}`);
        } catch (error) {
            console.error("Quantity Update Error:", error);
            const errorMessage = error.response?.data?.message || "Could not update quantity.";
            showNotification(errorMessage, 'error');
            fetchCart();
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/auth', { state: { from: '/cart' } });

        const itemToRemove = cart.find(item => item.id === itemId);
        
        const itemCard = document.querySelector(`.cart-item-card[data-id="${itemId}"]`);
        if (itemCard) {
             itemCard.style.animation = 'slideOutRight 0.5s ease-in forwards';
        }
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));

        try {
            const response = await removeCartItem(token, itemId);
            setCart(response.items);
            showNotification(`${itemToRemove?.product_name || 'Item'} removed successfully`);
            
        } catch (error) {
            console.error("Item Removal Error:", error);
            showNotification('Failed to remove item. Please refresh.', 'error');
            fetchCart();
        }
    };

    const handleClearCart = async () => {
        const token = localStorage.getItem('token');
        if (!token || cart.length === 0) return;

        if (window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
            setIsLoading(true);
            try {
                await clearCart(token);
                setCart([]);
                showNotification('Cart cleared successfully');
            } catch (error) {
                console.error("Cart Clear Error:", error);
                showNotification('Failed to clear cart. Please try again.', 'error');
                fetchCart();
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleCheckout = () => {
        if (!user) {
            showNotification('Please log in to proceed to checkout.', 'error');
            // Ensure we save the correct path for redirection after login
            return navigate('/auth', { state: { from: '/cart' } }); 
        }
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // CRITICAL FIX: Direct navigation to the checkout page
        navigate('/checkout');
    };

    // --- RENDER LOGIC (Remains unchanged) ---

    // 1. Loading State
    if (isLoading) {
        return (
            <div className="loading-overlay" style={{ display: 'flex' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }
    
    // 2. Not Logged In State (Using universally compatible icon)
    if (!user) {
        return (
            <div className="cart-container empty-cart-wrapper">
                <div className="empty-cart">
                    <div className="empty-cart-icon">👤</div> 
                    <h2>Please Log In</h2>
                    <p>Log in to view and manage the items in your cart.</p>
                    <a href="/auth" className="btn-browse">Log In / Register</a>
                </div>
            </div>
        );
    }

    // 3. Empty Cart State
    if (cart.length === 0) {
        return (
            <div className="cart-container empty-cart-wrapper">
                <div className="empty-cart">
                    <div className="empty-cart-icon">🛒</div>
                    <h2>Your Cart is Empty!</h2>
                    <p>It looks like you haven't added any items yet. Browse our collection to find something you love.</p>
                    <a href="/collections" className="btn-browse">Start Shopping</a>
                </div>
            </div>
        );
    }

    // 4. Full Cart Render
    return (
        <div className="cart-container">
            {/* Animated Background Particles */}
            <div className="bg-particles">
                <div className="particle"></div><div className="particle"></div><div className="particle"></div>
                <div className="particle"></div><div className="particle"></div><div className="particle"></div>
                <div className="particle"></div><div className="particle"></div><div className="particle"></div>
            </div>

            <h1 className="page-title">Your Cart</h1>
            
            {/* Cart Header with Stats */}
            <div className="cart-header">
                <div className="cart-stats">
                    <div className="stat-item">
                        <div className="stat-dot"></div>
                        <span id="item-count">{totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}</span>
                    </div>
                    <div className="stat-item">
                        <div className="stat-dot"></div>
                        <span>Ready for checkout</span>
                    </div>
                </div>
                <div className="cart-actions">
                    <button className="clear-cart-btn" onClick={handleClearCart}>Clear Cart</button>
                </div>
            </div>
            
            <div className="cart-grid">
                
                {/* Cart Items List */}
                <div className="cart-items" id="cart-items-list">
                    {cart.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemoveItem={handleRemoveItem}
                        />
                    ))}
                </div>

                {/* Order Summary */}
                <div className="order-summary" id="order-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span id="subtotal">₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>FREE</span>
                        </div>
                        <div className="summary-row">
                            <span>Taxes</span>
                            <span>Calculated at checkout</span>
                        </div>
                    </div>
                    <div className="summary-total">
                        <span>Total</span>
                        <span id="total-amount">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
                </div>
            </div>

            {/* Notification System */}
            <div className={`notification ${notification.type} ${notification.show ? 'show' : ''}`}>
                {notification.message}
            </div>
            
            {/* Conditional Loading Overlay */}
            {isLoading && (
                 <div className="loading-overlay" style={{ display: 'flex' }}>
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    );
};

export default CartPage;