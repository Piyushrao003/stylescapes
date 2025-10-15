// D:\stylescapes\frontend\src\components\Collection\CollectionHeader.js

import React, { useState, useEffect, useRef } from 'react';
import '../../styles/CollectionPage.css';

const CollectionHeader = ({
    productCount,
    sortBy,
    setSortBy,
    activeFilters,
    onRemoveFilterTag,
    onOpenSidebar
}) => {
    
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    const sortDropdownRef = useRef(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setSortMenuOpen(false);
            }
        };

        // Add event listener when dropdown is open
        if (sortMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sortMenuOpen]);

    const toggleSortMenu = (e) => {
        e.stopPropagation();
        setSortMenuOpen(prev => !prev);
    };

    const handleSortSelection = (value, label) => {
        setSortBy(value);
        setSortMenuOpen(false);
    };

    const SORT_OPTIONS = [
        { value: 'newest', label: 'Latest' },
        { value: 'featured', label: 'Featured' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Best Rated' },
    ];
    
    const selectedSortOptionLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Sort';
    const hasActiveFilters = activeFilters && activeFilters.length > 0;

    return (
        <div className="container" id="collection-page-content">
            <div className="header" id="collection-header">
                
                {/* TOP ROW: Hamburger + Product Count + Sort Dropdown */}
                <div className="header-controls">
                    {/* Left: Hamburger */}
                    <button 
                        className="hamburger" 
                        id="hamburger-btn" 
                        onClick={onOpenSidebar}
                        aria-label="Open filters" 
                        tabIndex="0"
                    >
                        <div className="hamburger-icon">
                            <div className="hamburger-line"></div>
                            <div className="hamburger-line"></div>
                            <div className="hamburger-line"></div>
                        </div>
                    </button>
                    
                    {/* Center: Product Count */}
                    <div className="product-count">
                        Showing <span id="product-count">{productCount}</span> items
                    </div>
                    
                    {/* Right: Sort Dropdown */}
                    <div className="sort-dropdown" id="sort-dropdown" ref={sortDropdownRef}>
                        <button 
                            className={`sort-control ${sortMenuOpen ? 'active' : ''}`} 
                            id="sort-control" 
                            onClick={toggleSortMenu}
                            type="button"
                            aria-expanded={sortMenuOpen} 
                            aria-controls="sort-menu"
                            aria-label="Sort options"
                        >
                            <span id="selected-sort-option">{selectedSortOptionLabel}</span>
                        </button>
                        {sortMenuOpen && (
                            <ul 
                                className="sort-options-menu open" 
                                id="sort-menu" 
                                role="listbox"
                                aria-label="Sort options menu"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <li 
                                        key={option.value}
                                        className={`sort-option-item ${sortBy === option.value ? 'selected' : ''}`} 
                                        data-value={option.value} 
                                        onClick={() => handleSortSelection(option.value, option.label)}
                                        role="option" 
                                        aria-selected={sortBy === option.value}
                                    >
                                        {option.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* BOTTOM ROW: Active Filter Tags */}
                {hasActiveFilters && (
                    <div className={`active-filters ${hasActiveFilters ? 'visible' : ''}`} id="active-filters">
                        <div className="active-filters-container" id="active-filters-container">
                            {activeFilters.map((filter, index) => (
                                <div key={index} className="active-filter-tag">
                                    <span>{filter.label}</span>
                                    <button 
                                        className="active-filter-remove" 
                                        data-type={filter.type} 
                                        data-value={filter.value} 
                                        onClick={() => onRemoveFilterTag(filter.type, filter.value)}
                                        tabIndex="0" 
                                        aria-label={`Remove ${filter.label} filter`}
                                    >×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionHeader;