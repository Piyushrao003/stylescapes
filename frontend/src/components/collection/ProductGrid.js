// D:\stylescapes\frontend\src\components\Collection\ProductGrid.js

import React from 'react';
import ProductCard from './ProductCard'; 
// NOTE: The .product-grid styles are expected to be available via global or CollectionPage CSS

const ProductGrid = ({ products, isLoading, user }) => {
    
    // Check if the products array is valid and has items to display
    const hasProducts = products && products.length > 0;

    return (
        <div className="collection-product-grid" id="product-grid-container">
            
            {isLoading ? (
                // 1. Loading State
                <p className="no-content-message">Loading products...</p>
                
            ) : hasProducts ? (
                // 2. Display Products (Maps dynamic data to ProductCard)
                products.map(product => (
                    <ProductCard 
                        // Uses product ID or UID for a unique key
                        key={product.id || product.uid} 
                        product={product} 
                        // Passes the user object for the wishlist authentication check
                        user={user} 
                    />
                ))
                
            ) : (
                // 3. Empty/Filtered Out State
                <p className="no-content-message">No products match the current filters.</p>
            )}
            
        </div>
    );
};

export default ProductGrid;