// D:\stylescapes\frontend\src\components\Product\ProductAccordion.js

import React, { useState, useRef, useEffect } from 'react';
import '../../styles/ProductAccordion.css'; 
// NOTE: ProductReviews component and its prop (reviewContent) handle the reviews tab.

const ACCORDION_ITEMS = [
    { id: 'description', title: 'Product Description & Specs' },
    { id: 'shipping', title: 'Shipping & Delivery' },
    { id: 'reviews', title: 'Reviews' }, // Title dynamically updated via props
];

// --- Helper for Trust Badges (simulates sub-component logic) ---
const renderTrustBadges = (badges) => {
    // Expects badges array: [{ icon: '...', text: '...' }]
    return (
        <div className="trust-badges">
            {badges.map((badge, index) => (
                <div key={index} className="trust-badge">
                    <div className="trust-badge-icon">{badge.icon}</div>
                    <div className="trust-badge-text">{badge.text}</div>
                </div>
            ))}
        </div>
    );
};

// --- React Component ---

const ProductAccordion = ({ productData, reviewContent }) => {
    
    const [openItemId, setOpenItemId] = useState(null);
    const contentRefs = useRef({}); 
    
    // Default/Fallback data structures
    const defaultData = {
        description: "Product details are not available yet. Please check back soon.",
        features: ["High-durability fabric", "Slim fit", "Machine washable"],
        trust_badges: [
            { icon: '🔒', text: 'Secure Payment' },
            { icon: '📦', text: 'Hassle-Free Returns' },
            { icon: '📍', text: 'Global Tracking' },
            { icon: '💯', text: '100% Authentic' },
        ],
        reviewCount: 0 
    };

    const data = { 
        ...defaultData, 
        ...productData 
    };
    
    // Update review title dynamically based on the reviewContent's summary prop
    const reviewCount = reviewContent?.props?.summary?.count || data.reviewCount;
    ACCORDION_ITEMS[2].title = `Reviews (${reviewCount})`;

    // --- Logic to Handle Accordion Toggle ---
    const handleToggle = (itemId) => {
        setOpenItemId(prevId => prevId === itemId ? null : itemId);
    };
    
    // --- Effect to manage maxHeight property for CSS transition ---
    useEffect(() => {
        Object.keys(contentRefs.current).forEach(itemId => {
            const contentDiv = contentRefs.current[itemId];
            if (!contentDiv) return;

            if (itemId === openItemId) {
                // Ensure scrollHeight includes dynamically rendered content (like reviews)
                contentDiv.style.maxHeight = `${contentDiv.scrollHeight}px`;
            } else {
                contentDiv.style.maxHeight = '0';
            }
        });
        
    }, [openItemId, reviewCount]); // Dependency on reviewCount ensures reviews content height is recalculated

    // --- Content Render Helpers ---
    const renderContent = (itemId) => {
        switch (itemId) {
            case 'description':
                return (
                    <>
                        <p>{data.description}</p>
                        <ul>
                            {data.features?.map((feature, index) => (
                                <li key={index}><strong>{feature}</strong></li>
                            ))}
                        </ul>
                    </>
                );
            case 'shipping':
                return (
                    <>
                        <p>Experience swift and secure delivery with our partners. Standard delivery is estimated at 5-7 business days. All shipments are fully tracked for your peace of mind.</p>
                        
                        {/* Renders the Trust Badges with Box Design */}
                        {renderTrustBadges(data.trust_badges)}
                    </>
                );
            case 'reviews':
                // Pass the ProductReviews component prop here
                return reviewContent;
            default:
                return null;
        }
    };

    return (
        <div className="accordion-section" id="productAccordion">
            {ACCORDION_ITEMS.map((item, index) => {
                const isOpen = openItemId === item.id;
                
                return (
                    <div 
                        key={item.id}
                        className={`accordion-item ${isOpen ? 'open' : ''}`} 
                    >
                        <div className="accordion-header" onClick={() => handleToggle(item.id)} tabIndex="0" role="button">
                            <span className="accordion-title">{item.title}</span>
                            <span className="accordion-icon">+</span>
                        </div>
                        
                        <div 
                            className="accordion-content" 
                            ref={el => contentRefs.current[item.id] = el}
                            aria-expanded={isOpen}
                        >
                            {renderContent(item.id)}
                        </div>
                    </div>
                );
            })}
            
            <div className="accordion-separator"></div>
            
        </div>
    );
};

export default ProductAccordion;