// D:\stylescapes\frontend\src\pages\CheckoutPage.js

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { getCart, updateCartItem } from '../api/userApi'; 
import { createOrder } from '../api/ordersApi'; 
import { validateCoupon } from '../api/couponsApi'; 
import { getProductById } from '../api/productsApi'; 
import '../styles/Checkout.css'; 

// --- Pincode API Base URL (External, Cost-Free Service - Remains Unchanged) ---
const PINCODE_API_BASE_URL = 'https://api.postalpincode.in/pincode/';

// --- HELPER FUNCTIONS (Remains Unchanged) ---

const validateCouponBackend = async (couponCode, totalAmount) => {
    try {
        const response = await validateCoupon(couponCode, totalAmount);
        return response; 
    } catch (error) {
        throw error;
    }
};

const calculateTotals = (items, couponData) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 0; 
    const taxes = Math.round(subtotal * 0.05);

    let discount = 0;
    
    if (couponData?.success && couponData?.type) {
        if (couponData.type === 'percentage') {
            discount = Math.round((subtotal * couponData.value) / 100);
        } else if (couponData.type === 'flat_rate') {
            discount = couponData.value;
        }
    }
    
    const grandTotal = subtotal + shippingCost + taxes - discount;
    return { subtotal, shippingCost, taxes, discount, grandTotal };
};

// --- Sub-Components (AddressForm FIX APPLIED) ---

const AddressForm = ({ address, setAddress, user, onLocationDetect, isLocationLoading, formErrors = {}, onPincodeChange }) => {
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
        
        if (name === 'zip' && value.length === 6 && /^\d{6}$/.test(value)) {
            onPincodeChange(value);
        }
    };

    return (
        <div class="form-section active" id="step1-content">
            <h2>Shipping Information</h2>
            <form id="checkoutForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="email">Email Address *</label>
                        <input
                            type="email" id="email" name="email" required
                            placeholder="name@example.com"
                            value={address.email || user?.email || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div class="form-group">
                        <label for="fullName">Full Name *</label>
                        <input
                            type="text" id="fullName" name="fullName" required
                            placeholder="John Doe"
                            value={address.fullName || (user?.firstName || '') + ' ' + (user?.lastName || '') || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="houseNumber">House Number / Flat / Building & Landmark *</label>
                        <input
                            type="text" id="houseNumber" name="houseNumber" required
                            placeholder="e.g., Flat 301, Galaxy Apartments, Near City Mall"
                            value={address.houseNumber || user?.address?.address_line_1 || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="address">Street Address / Colony / Area</label>
                        <input
                            type="text" id="address" name="address"
                            placeholder="Street name or colony (auto-filled or editable)"
                            value={address.address || user?.address?.address_line_2 || ''}
                            onChange={handleInputChange}
                        />
                        <button type="button" id="location-btn" 
                            class={`location-button ${isLocationLoading ? 'loading' : ''}`}
                            // Geolocation Handler remains intact
                            onClick={onLocationDetect}
                            disabled={isLocationLoading}
                        >
                            <span className="location-icon">○</span> 
                            {isLocationLoading ? 'Getting location...' : 'Use Current Location'}
                        </button>
                    </div>
                </div>
                <div class="form-grid-three-col">
                    <div class="form-group">
                        <label for="city">City</label>
                        <input type="text" id="city" name="city" placeholder="City" value={address.city || user?.address?.city || ''} onChange={handleInputChange}/>
                    </div>
                    <div class="form-group">
                        <label for="state">State</label>
                        <input type="text" id="state" name="state" placeholder="State" value={address.state || user?.address?.state || ''} onChange={handleInputChange}/>
                    </div>
                    <div class="form-group">
                        <label for="zip">ZIP Code</label>
                        <input type="text" id="zip" name="zip" placeholder="12345" value={address.zip || user?.address?.zip_code || ''} onChange={handleInputChange}/>
                    </div>
                    <div class="form-group">
                        <label for="country">Country</label>
                        <input type="text" id="country" name="country" value={address.country || 'India'} readOnly/>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="phone">Phone Number *</label>
                        <input
                            type="tel" id="phone" name="phone" required
                            placeholder="+91 9876543210"
                            value={address.phone || user?.phone_number || ''}
                            onChange={handleInputChange}
                        />
                        {/* FIX: formErrors is guaranteed to be an object here */}
                        {formErrors.general && <p className="error-message" style={{ color: 'var(--error-red)' }}>{formErrors.general}</p>}
                    </div>
                </div>
            </form>
        </div>
    );
};

const ProductSummaryItem = ({ item, onQuantityChange }) => (
    <div className="product-item">
        <img 
            src={item.image_url} 
            alt={item.product_name} 
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80"; }}
        />
        <div className="product-item-info">
            <h4>{item.product_name}</h4>
            <p>Color: {item.selected_color} | Size: {item.selected_size}</p>
            <div className="product-quantity">
                <span style={{ color: 'var(--secondary-text)', fontSize: '0.8rem' }}>Qty:</span>
                <button
                    className="quantity-btn"
                    data-action="decrease"
                    onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity === 1 || item.isDirectCheckout} 
                >−
                </button>
                <span className="quantity-display">{item.quantity}</span>
                <button
                    className="quantity-btn"
                    data-action="increase"
                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    disabled={item.isDirectCheckout} 
                    >+
                </button>
            </div>
            <span className="price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
        </div>
    </div>
);

// --- Main Checkout Component ---

const CheckoutPage = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const [cart, setCart] = useState([]);
    const [isDirectCheckout, setIsDirectCheckout] = useState(false); 
    const [isLoading, setIsLoading] = useState(true);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({}); // Initialized to {}
    
    const [couponInput, setCouponInput] = useState('');
    const [couponData, setCouponData] = useState({ code: null, message: '', success: false, type: null, value: 0 });
    const [isAddressConfirmed, setIsAddressConfirmed] = useState(false); 

    const [currentStep, setCurrentStep] = useState(1); 
    
    const [address, setAddress] = useState({
        email: user?.email || '',
        fullName: (user?.first_name || '') + ' ' + (user?.last_name || ''),
        houseNumber: user?.address?.address_line_1 || '',
        address: user?.address?.address_line_2 || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zip: user?.address?.zip_code || '',
        country: user?.address?.country || 'India',
        phone: user?.phone_number || '',
    });

    const token = localStorage.getItem('token');
    
    const totals = useMemo(() => calculateTotals(cart, couponData), [cart, couponData]);

    // --- Pincode Handler (Remains Unchanged) ---
    const handlePincodeChange = useCallback(async (pincode) => {
        if (isLocationLoading) return;
        
        try {
            const response = await fetch(`${PINCODE_API_BASE_URL}${pincode}`);
            const data = await response.json();
            
            if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
                const office = data[0].PostOffice[0]; 
                
                setAddress(prev => ({
                    ...prev,
                    city: office.District,
                    state: office.State,
                }));
            } else {
                console.warn(`Pincode lookup failed for ${pincode}.`);
            }
        } catch (error) {
            console.error("Pincode API error:", error);
        }
    }, [isLocationLoading]);
    
    // --- Geolocation Handler (Logic kept intact) ---
    const handleLocationDetection = async () => {
        if (!("geolocation" in navigator)) {
             alert("Geolocation is not supported by your browser.");
             return;
        }
        
        setIsLocationLoading(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    let response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        {
                            headers: {
                                "Accept-Language": "en",
                                "User-Agent": "StylescapesCheckout/2.0",
                            },
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        const addr = data.address;
                        
                        setAddress(prev => ({
                            ...prev,
                            address: addr.road || addr.street || addr.neighbourhood || '',
                            city: addr.city || addr.town || addr.village || '',
                            state: addr.state || '',
                            zip: addr.postcode || '',
                            country: addr.country || 'India',
                        }));
                        
                        alert("Address found and autofilled.");
                    } else {
                        throw new Error("Geocoding failed");
                    }
                } catch (error) {
                     alert("Could not find exact address. Please enter street/colony details manually.");
                } finally {
                    setIsLocationLoading(false);
                }
            },
            (error) => {
                alert("Location error: Please enable location access or enter address manually.");
                setIsLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
    };

    // --- CORE FETCH FUNCTION (Dual Flow) ---
    const fetchData = useCallback(async () => {
        if (!user || !token) {
            navigate('/auth', { state: { from: '/checkout' } });
            return;
        }
        setIsLoading(true);

        const directItemString = sessionStorage.getItem('directCheckoutItem');
        const isDirectFlow = location.search.includes('flow=direct') && directItemString;
        
        if (isDirectFlow) {
            try {
                const directItem = JSON.parse(directItemString);
                
                const productData = await getProductById(directItem.productId);
                
                if (!productData) throw new Error("Direct checkout product data missing.");
                
                const currentPrice = productData.price?.sale_price || productData.price?.base_price || 0;
                
                const singleCartItem = {
                    id: `${directItem.productId}_${directItem.selectedColor}_${directItem.selectedSize}`,
                    product_id: directItem.productId,
                    product_name: productData.product_name,
                    quantity: directItem.quantity,
                    price: currentPrice,
                    selected_size: directItem.selectedSize,
                    selected_color: directItem.selectedColor,
                    image_url: productData.images?.image_url,
                    isDirectCheckout: true, 
                };
                
                setCart([singleCartItem]);
                setIsDirectCheckout(true);
                sessionStorage.removeItem('directCheckoutItem'); 

            } catch (error) {
                console.error("Direct Checkout Failed:", error);
                alert("Failed to load direct item. Please try again or use the standard cart.");
                navigate('/cart');
            }
        } else {
            try {
                const cartData = await getCart(token); 
                const safeCartData = Array.isArray(cartData) ? cartData : [];
                
                if (safeCartData.length === 0) {
                    alert("Your cart is empty. Redirecting to shopping.");
                    navigate('/collections');
                    return;
                }
                
                setCart(safeCartData);
                setIsDirectCheckout(false);
                
            } catch (error) {
                console.error("Standard Checkout data fetch failed:", error);
                alert("Failed to load checkout data. Please check your cart."); 
                navigate('/cart');
            }
        }
        
        setIsLoading(false);
    }, [user, token, navigate, location.search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // --- Handlers (Quantity, Coupon, Navigation) ---
    const handleQuantityChange = useCallback(async (itemId, newQty) => {
        if (newQty < 1 || isDirectCheckout) return; 

        const existingItem = cart.find(item => item.id === itemId);
        if (!existingItem) return;

        const itemDetails = {
            productId: existingItem.product_id,
            selectedColor: existingItem.selected_color,
            selectedSize: existingItem.selected_size,
            quantity: newQty,
        };

        try {
            const response = await updateCartItem(token, itemDetails); 
            fetchData(); 
        } catch (error) {
            alert(`Failed to update quantity: ${error.response?.data?.message || 'Server error.'}`);
            fetchData(); 
        }
    }, [cart, token, fetchData, isDirectCheckout]);
    
    const handleApplyCoupon = async () => {
        const code = couponInput.toUpperCase().trim();
        if (!code) {
            setCouponData({ code: null, message: "Please enter a coupon code", success: false, type: null, value: 0 });
            return;
        }

        setIsLoading(true);
        try {
            const validationResult = await validateCouponBackend(code, totals.subtotal);
            
            const type = validationResult.discount_type;
            const value = validationResult.discount_value;
            
            const message = type === 'flat_rate' 
                ? `✓ Saved ₹${value}` 
                : `✓ ${value}% off applied`;
                
            setCouponData({ 
                code: code, 
                message: message, 
                success: true, 
                type: type, 
                value: value 
            });
            
        } catch (error) {
            const backendErrorMsg = error.response?.data?.message || "Invalid or expired code.";
            
            setCouponData({ 
                code: null, 
                message: `✗ ${backendErrorMsg}`, 
                success: false, 
                type: null, 
                value: 0 
            });
            
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponInput('');
        setCouponData({ code: null, message: '', success: false, type: null, value: 0 });
    };

    const requiredFieldsValid = useMemo(() => {
        const inputs = [
            address.email, address.fullName, address.houseNumber, address.phone
        ];
        const isValid = inputs.every(val => val && val.trim() !== '');
        return isValid;
    }, [address]);

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (!requiredFieldsValid) {
                setFormErrors({ general: "Please fill in all required fields." });
                return;
            }
            if (!isAddressConfirmed) {
                setFormErrors({ general: "Please confirm address liability before continuing." });
                return;
            }

            setFormErrors({}); 
            setCurrentStep(2);
        } else if (currentStep === 2) {
            handlePlaceOrder();
        }
    };
    
    // --- Order Placement (Updated for Direct Checkout Payload) ---

    const handlePlaceOrder = async () => {
        if (cart.length === 0) return alert("Your cart is empty.");
        
        setIsLoading(true);
        try {
            // 1. Prepare Base Order Data
            const orderPayload = {
                total_amount: totals.grandTotal,
                shipping_info: {
                    shipping_address: `${address.houseNumber}, ${address.address}, ${address.city}, ${address.state} ${address.zip}`,
                    shipping_provider: 'Standard Delivery', 
                    shipping_charges: totals.shippingCost,
                },
                coupon_code: couponData.code,
                address: {
                    address_line_1: address.houseNumber,
                    address_line_2: address.address,
                    city: address.city,
                    state: address.state,
                    zip_code: address.zip,
                }
            };
            
            // 2. CRITICAL: Add item details based on flow
            if (isDirectCheckout) {
                const item = cart[0]; 
                orderPayload.direct_item = {
                    product_id: item.product_id,
                    selected_color: item.selected_color,
                    selected_size: item.selected_size,
                    quantity: item.quantity,
                };
            } else {
                // Backend knows to fetch from the permanent cart when direct_item is missing
            }

            // 3. Call Backend to Create Order and Initiate Payment Flow
            const orderResponse = await createOrder(orderPayload, token); 

            // 4. Handle Payment Initiation (Placeholder for Paytm Redirect)
            if (orderResponse.paymentUrl) {
                window.location.href = orderResponse.paymentUrl;
            } else {
                alert(`Order created successfully. Order ID: ${orderResponse.order.order_id}`);
                navigate('/orders');
            }

        } catch (error) {
            console.error("Order placement failed:", error);
            alert(`Order failed: ${error.response?.data?.message || 'Server error.'}`);
        } finally {
            setIsLoading(false);
        }
    };


    if (isLoading) {
        return <div className="loading-state">Preparing checkout...</div>;
    }

    return (
        <div className="checkout-container">
            <h1 className="page-title">Secure Checkout</h1>
            
            <div className="checkout-wrapper">
                
                {/* LEFT COLUMN: Order Summary & Item List (HTML Fidelity) */}
                <div class="order-summary-top">
                    <div class="product-summary-container">
                        <h3 class="product-summary-header">
                            Order Summary {(Array.isArray(cart) ? cart.length : 0)} items 
                            {isDirectCheckout && <span style={{fontSize: '0.8rem', color: 'var(--success-green)', marginLeft: '1rem'}}>(Direct Purchase)</span>}
                        </h3>

                        <div class="products-scroll">
                            {Array.isArray(cart) && cart.map(item => (
                                <ProductSummaryItem 
                                    key={item.id} 
                                    item={item} 
                                    onQuantityChange={handleQuantityChange}
                                />
                            ))}
                        </div>
                    </div>
                    
                    {/* Price Details Card */}
                    <div class="order-summary-card">
                        <h5>Price Details</h5>
                        <div class="summary-list">
                            <div class="summary-item">
                                <span class="label">Subtotal ({Array.isArray(cart) ? cart.length : 0} items):</span>
                                <span class="value">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">Shipping (Standard Delivery):</span>
                                <span class="value">FREE</span>
                            </div>
                            <div class="summary-item">
                                <span class="label">Taxes (5%):</span>
                                <span class="value">₹{totals.taxes.toLocaleString('en-IN')}</span>
                            </div>
                            {totals.discount > 0 && (
                                <div class="summary-item">
                                    <span class="label">Discount ({couponData.code}):</span>
                                    <span class="value" style={{color: 'var(--success-green)'}}>-₹{totals.discount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                        </div>
                        <div class="summary-total">
                            <span>Total:</span>
                            <span class="value">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Form Container */}
                <div class="form-container">
                    
                    {/* Step 1: Shipping Information (Address) */}
                    <div className={`form-section ${currentStep === 1 ? 'active' : ''}`} >
                        <AddressForm 
                            address={address} 
                            setAddress={setAddress} 
                            user={user} 
                            onLocationDetect={handleLocationDetection}
                            isLocationLoading={isLocationLoading}
                            formErrors={formErrors}
                            onPincodeChange={handlePincodeChange}
                        />
                        
                        {/* NEW CHECKPOINT: ADDRESS CONFIRMATION */}
                        <div className="shipping-method-section">
                            <h3>2. Order Finalization</h3>
                            <div className="address-confirmation-box">
                                <label className="liability-checkbox">
                                    <input 
                                        type="checkbox" 
                                        checked={isAddressConfirmed}
                                        onChange={(e) => {
                                            setIsAddressConfirmed(e.target.checked);
                                            setFormErrors({}); 
                                        }}
                                    />
                                    <span style={{ color: 'var(--secondary-text)' }}>I confirm that the **Email, Phone, and Shipping Address** are correct. I understand that the shop bears **no liability** for delivery failures due to inaccurate details.</span>
                                </label>
                                <div className="terms-link">
                                    <small>For more details, see our <Link to="/policies/terms" target="_blank">Terms & Conditions</Link>.</small>
                                </div>
                            </div>
                        </div>
                        
                    </div>

                    {/* Step 2: Review & Payment (HTML Fidelity) */}
                    <div className={`form-section ${currentStep === 2 ? 'active' : ''}`} id="step2-content">
                        <h2>Review & Payment</h2>
                        <p>Review your order details and confirm payment method.</p>
                        
                        <div class="coupon-section">
                            <h3>Have a Coupon Code?</h3>
                            <div class="coupon-input-group">
                                <input
                                    type="text" id="couponInput" placeholder="Enter coupon code"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value)}
                                    disabled={couponData.success || isLoading}
                                />
                                <button
                                    type="button" class="apply-coupon-btn"
                                    onClick={handleApplyCoupon}
                                    style={{ display: couponData.success ? 'none' : 'block' }}
                                    disabled={isLoading}
                                >
                                    Apply
                                </button>
                                <button
                                    type="button" class="remove-coupon-btn"
                                    onClick={handleRemoveCoupon}
                                    style={{ display: couponData.success ? 'block' : 'none' }}
                                    disabled={isLoading}
                                >
                                    Remove
                                </button>
                            </div>
                            {couponData.message && (
                                <div class={`coupon-message ${couponData.success ? 'success' : 'error'}`}>
                                    {couponData.message}
                                </div>
                            )}
                        </div>

                        <div class="final-summary">
                            <ul>
                                <li>
                                    <span>Shipping Address:</span>
                                    <span id="reviewAddress">{address.houseNumber} ... {address.zip}</span>
                                </li>
                                <li>
                                    <span>Shipping Provider:</span>
                                    <span>Standard Delivery (Free)</span>
                                </li>
                                <li>
                                    <span>Subtotal:</span> <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                                </li>
                                {totals.discount > 0 && (
                                    <li id="reviewDiscountRow">
                                        <span>Discount ({couponData.code}):</span>
                                        <span style={{color: 'var(--success-green)'}}>-₹{totals.discount.toLocaleString('en-IN')}</span>
                                    </li>
                                )}
                                <li><span>Taxes:</span> <span>₹{totals.taxes.toLocaleString('en-IN')}</span></li>
                                <li class="total-row">
                                    <span>Grand Total:</span>
                                    <span>₹{totals.grandTotal.toLocaleString('en-IN')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button 
                            type="button" 
                            class="btn" 
                            id="next-btn"
                            onClick={handleNextStep}
                            disabled={isLoading}
                        >
                            {currentStep === 1 
                                ? 'Continue to Review' 
                                : `Pay ₹${totals.grandTotal.toLocaleString('en-IN')} (Paytm)`
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;