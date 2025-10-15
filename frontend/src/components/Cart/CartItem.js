// D:\stylescapes\frontend\src\components\Cart\CartItem.js

import React from 'react';
import '../../styles/Cart.css'; 

/**
 * Renders a single, interactive cart item.
 * NOTE: It relies on the parent (CartPage) receiving the denormalized fields 
 * (price, name, image_url) from the backend's userService lookup.
 * * @param {object} item - The cart item object (must include id, product_name, price, image_url, color, size, qty).
 * @param {function} onUpdateQuantity - Function passed from the parent to change the quantity.
 * @param {function} onRemoveItem - Function passed from the parent to remove the item.
 */
const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {

    // Safely calculate the line item subtotal
    const unitPrice = item.price || 0;
    const quantity = item.quantity || 0;
    const lineSubtotal = unitPrice * quantity;
    const formattedPrice = `₹${lineSubtotal.toLocaleString('en-IN')}`;

    // --- Handlers for quantity change ---
    const handleQuantityChange = (change) => {
        const newQty = quantity + change;
        if (newQty >= 1) {
            // Call parent function to handle API update
            onUpdateQuantity(item.id, newQty);
        }
    };
    
    // --- Handler for removal ---
    const handleRemove = () => {
        // Call parent function to handle API removal
        onRemoveItem(item.id);
    };

    return (
        <div className="cart-item-card" data-id={item.id}>
            <img 
                src={item.image_url} 
                alt={item.product_name} 
                className="item-image" 
                // Fallback image in case URL is broken
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/120x120/1a1a1a/a0a0a0?text=No+Image"; }}
            />
            
            <div className="item-details">
                <h3>{item.product_name}</h3>
                <p>Color: {item.selected_color} | Size: {item.selected_size}</p>
                
                <div className="quantity-selector">
                    <button 
                        className="qty-btn minus-btn" 
                        onClick={() => handleQuantityChange(-1)} 
                        disabled={quantity <= 1}
                        aria-label={`Decrease ${item.product_name} quantity`}
                    >
                        <span>−</span>
                    </button>
                    <input 
                        type="number" 
                        className="qty-input" 
                        value={quantity} 
                        min="1" 
                        readOnly
                        aria-label={`Current ${item.product_name} quantity`}
                    />
                    <button 
                        className="qty-btn plus-btn" 
                        onClick={() => handleQuantityChange(1)}
                        aria-label={`Increase ${item.product_name} quantity`}
                    >
                        <span>+</span>
                    </button>
                </div>
            </div>
            
            {/* Price Display: Shows the calculated line subtotal */}
            <span className="item-price">{formattedPrice}</span>
            
            {/* Remove Button */}
            <button className="remove-btn" onClick={handleRemove}>
                Remove
            </button>
        </div>
    );
};

export default CartItem;