// D:\stylescapes\frontend\src\components\Product\ProductOptions.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/ProductOptions.css'; 

const ProductOptions = ({ product, onSelectVariation, onAddToCart, initialSelectedVariant }) => {
    
    // Deconstruct product properties
    const colors = product.available_colors || [];
    const sizes = product.available_sizes || [];
    const variantInventory = product.variant_inventory || {}; 
    
    // State
    const [selectedColor, setSelectedColor] = useState(initialSelectedVariant.color);
    const [selectedSize, setSelectedSize] = useState(initialSelectedVariant.size);
    const [ctaStatus, setCtaStatus] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const navigate = useNavigate();

    // --- Helper Functions (Defined within scope) ---

    // 1. Stock Calculation Logic (Remains Unchanged)
    const stockLevel = useMemo(() => {
        if (!selectedColor || !selectedSize) return -1;

        // Use the original, mixed-case product.id to match the SKU key created 
        const product_id_original_case = product.id; 
        
        // Normalize variant attributes (color and size are always lowercase in the SKU)
        const normalizedColor = selectedColor.toLowerCase().replace(/\s/g, '-');
        const normalizedSize = selectedSize.toLowerCase();
        
        const variantId = `${product_id_original_case}_${normalizedColor}_${normalizedSize}`;
        const stockData = variantInventory[variantId];
        
        return stockData ? stockData.stock_level : 0; 
        
    }, [selectedColor, selectedSize, product.id, variantInventory]);

    // 2. Swatch Style Helper
    const getSwatchStyle = useCallback((hex) => ({ backgroundColor: hex }), []);

    // 3. Color Selection Handler
    const handleColorClick = useCallback((colorName) => {
        setSelectedColor(colorName);
        setCtaStatus('');
        onSelectVariation({ color: colorName, size: selectedSize, quantity: 1 });
    }, [onSelectVariation, selectedSize]);

    // 4. Size Selection Handler
    const handleSizeClick = useCallback((size) => {
        setSelectedSize(size);
        setCtaStatus('');
        onSelectVariation({ color: selectedColor, size: size, quantity: 1 });
    }, [onSelectVariation, selectedColor]);


    // --- Derived Status (Remains Unchanged) ---
    const isSelectionComplete = useMemo(() => {
        const colorSelected = colors.length === 0 || !!selectedColor;
        const sizeSelected = sizes.length === 0 || !!selectedSize;
        return colorSelected && sizeSelected;
    }, [colors.length, sizes.length, selectedColor, selectedSize]);

    const isOutOfStock = stockLevel === 0;
    const isButtonDisabled = isProcessing || !isSelectionComplete || isOutOfStock;


    // --- Lifecycle to Handle Initialization (Remains Unchanged) ---
    useEffect(() => {
        setSelectedColor(initialSelectedVariant.color);
        setSelectedSize(initialSelectedVariant.size);
        onSelectVariation(initialSelectedVariant);
    }, [initialSelectedVariant, onSelectVariation]); 

    // --- CRITICAL: ACTION HANDLER UPDATE (Direct Checkout Flow) ---
    
    const handleCtaAction = async (actionType) => {
        // Step 1: Frontend Validation
        if (!isSelectionComplete) {
             setCtaStatus('Please select all required options (Color and Size).');
             return;
        }
        if (isOutOfStock) {
             setCtaStatus('This specific item variant is currently out of stock.');
             return;
        }

        const payload = { selectedColor, selectedSize, quantity: 1 };
        
        setIsProcessing(true);
        setCtaStatus(actionType === 'buy' ? 'Processing...' : 'Adding...');
        
        try {
            if (actionType === 'buy') {
                // --- DIRECT CHECKOUT FLOW ---
                const directItemPayload = {
                    productId: product.id,
                    selectedColor: payload.selectedColor,
                    selectedSize: payload.selectedSize,
                    quantity: payload.quantity,
                };
                
                // Use Session Storage to temporarily hold the direct item payload
                sessionStorage.setItem('directCheckoutItem', JSON.stringify(directItemPayload));

                // Navigate directly to the checkout page with the flow flag
                navigate('/checkout?flow=direct');
                
            } else {
                // --- STANDARD ADD TO CART FLOW ---
                const result = await onAddToCart(payload, actionType); 

                if (result.success) {
                    setCtaStatus(`Added 1 item to cart!`);
                }
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to process request.';
            setCtaStatus(`Failed: ${errorMessage}`); 
            
        } finally {
            setIsProcessing(false);
            if (actionType === 'add') {
                setTimeout(() => setCtaStatus(''), 2500);
            }
        }
    };


    // --- Stock Status Message (Final Clean Version) ---
    const renderStockStatus = () => {
        if (!isSelectionComplete) {
            return <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>Please select options above to view stock.</p>;
        }
        
        if (stockLevel > 5) {
            return null; 
        } else if (stockLevel > 0) {
            return (
                <p style={{ color: 'var(--discount-red)', fontWeight: 600 }}>
                    🚨 Hurry up! Only {stockLevel} left!
                </p>
            );
        } else if (stockLevel === 0) {
            return <p style={{ color: 'var(--discount-red)' }}>Out of Stock</p>;
        }
        
        return null;
    };


    return (
        <div className="product-options-container">
            {/* Options Section */}
            <div className="product-options">
                
                {/* --- 1. CONDITIONAL COLOR RENDERING --- */}
                {colors.length > 0 && (
                    <div className="option-group">
                        <span className="option-label">Color: <span id="selectedColor">{selectedColor || 'None'}</span></span>
                        <div className="color-swatches" id="colorSwatches">
                            {colors.map((color, index) => (
                                <div 
                                    key={index}
                                    className={`color-swatch ${selectedColor === color.name ? 'active' : ''}`} 
                                    data-color={color.name} 
                                    style={getSwatchStyle(color.hex_code)}
                                    onClick={() => handleColorClick(color.name)}
                                    role="radio"
                                    aria-checked={selectedColor === color.name}
                                    tabIndex="0"
                                ></div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* --- 2. SIZE RENDERING --- */}
                {sizes.length > 0 && (
                    <div className="option-group">
                        <span className="option-label">Size: <span id="selectedSize">{selectedSize || 'None'}</span></span>
                        <div className="size-options" id="sizeOptions">
                            {sizes.map((size, index) => (
                                <span 
                                    key={index}
                                    className={`size-option ${selectedSize === size ? 'active' : ''}`} 
                                    data-size={size}
                                    onClick={() => handleSizeClick(size)}
                                    role="button"
                                    aria-pressed={selectedSize === size}
                                    tabIndex="0"
                                >
                                    {size}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Stock Status Display */}
            <div style={{ marginBottom: '1.5rem' }}>
                {renderStockStatus()}
            </div>

            <div className="cta-buttons" style={{ marginTop: '2rem' }}>
                <button 
                    className="btn-add-to-cart" 
                    id="addToCart"
                    onClick={() => handleCtaAction('add')}
                    disabled={isButtonDisabled}
                >
                    {isProcessing ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button 
                    className="btn-buy-now" 
                    id="buyNow"
                    onClick={() => handleCtaAction('buy')}
                    disabled={isButtonDisabled}
                >
                    {isProcessing && ctaStatus.includes('Processing') ? 'Processing...' : 'Buy Now'}
                </button>
            </div>
            
            <p className="status-message" id="ctaStatus" style={{ color: ctaStatus.includes('Please select') || ctaStatus.includes('Failed') ? '#e74c3c' : (ctaStatus.includes('Added') ? '#10b981' : 'var(--accent-blue)') }}>
                {ctaStatus}
            </p>
        </div>
    );
};

export default ProductOptions;