// D:\stylescapes\frontend\src\components\Collection\FilterSidebar.js

import React from "react";
import "../../styles/Filter.css";

// --- Helper Functions ---
const renderFilterOptions = (
  title,
  options,
  type,
  activeFilters,
  handleToggleFilter
) => {
  const checkedValues =
    type === "minRating" ? activeFilters.minRating : activeFilters[type];

  return (
    <div className="filter-section">
      <h4 className="filter-title">{title}</h4>
      <div className="filter-options">
        {options.map((option) => {
          const isChecked = Array.isArray(checkedValues)
            ? checkedValues.includes(option.value)
            : checkedValues === option.value;

          return (
            <div
              key={option.value}
              className="filter-option"
              onClick={() => handleToggleFilter(type, option.value)}
              tabIndex="0"
              data-filter={type}
              data-value={option.value}
            >
              <div
                className={`filter-checkbox ${isChecked ? "checked" : ""}`}
                data-value={option.value}
              ></div>
              <span className="filter-label">{option.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- FilterSidebar Component ---

const FilterSidebar = ({
  activeFilters,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  handleToggleFilter,
  handlePriceChange,
  handleClearAllFilters,
  isFilterActive,
}) => {
  // FIXED: Proper close handler that updates React state
  const closeSidebarFn = () => {
    setSidebarOpen(false);
    document.body.classList.remove("no-scroll");
  };

  // FIXED: Desktop collapse handler that properly updates React state
  const handleDesktopClose = () => {
    setSidebarCollapsed(true);
  };

  // Mobile apply filters handler
  const handleApplyFilters = () => {
    closeSidebarFn();
  };

  const CATEGORIES = [
    { value: "T-shirt", label: "T-shirt" },
    { value: "Shirt", label: "Shirts" },
    { value: "Jeans", label: "Jeans" },
    { value: "Pajama", label: "Pajamas" },
    { value: "Jacket", label: "Jackets" },
    { value: "Short", label: "Shorts" },
    { value: "Hoodie", label: "Hoodies" },
    { value: "Sweatshirt", label: "Sweatshirts" },
    { value: "Sweater", label: "Sweater" },
  ];

  // --- JSX Structure ---
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebarFn}
      ></div>

      <div
        className={`sidebar ${sidebarOpen ? "open" : ""} ${
          sidebarCollapsed ? "collapsed" : ""
        }`}
        id="sidebar"
      >
        {/* Desktop Close Button Container */}
        <div className="sidebar-top-controls">
          <div className="sidebar-logo">Filters</div>
          <button
            className="close-sidebar"
            onClick={handleDesktopClose}
            aria-label="Close filters"
            title="Close sidebar"
          >
            &times;
          </button>
        </div>

        {/* Mobile Header with Close Button */}
        <div className="mobile-header" id="mobile-header">
          <h3 className="sidebar-title">Filters</h3>
          <button
            className="close-sidebar"
            onClick={closeSidebarFn}
            aria-label="Close filters"
          >
            &times;
          </button>
        </div>

        <div className="sidebar-content" id="sidebar-content">
          <button
            className="clear-filters-btn"
            id="clear-filters-btn"
            onClick={handleClearAllFilters}
            disabled={!isFilterActive}
          >
            <span>Clear All Filters</span>
          </button>

          {/* Category Filter */}
          {renderFilterOptions(
            "Category",
            CATEGORIES,
            "categories",
            activeFilters,
            handleToggleFilter
          )}

          {/* Price Range */}
          <div className="filter-section">
            <h4 className="filter-title">Price Range</h4>
            <div className="price-inputs">
              <div className="price-input-wrapper">
                <input
                  type="number"
                  className="price-input"
                  id="min-price"
                  placeholder="Min"
                  min="0"
                  value={activeFilters.minPrice || ""}
                  onChange={(e) => handlePriceChange(e, "minPrice")}
                />
              </div>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  className="price-input"
                  id="max-price"
                  placeholder="Max"
                  min="0"
                  value={activeFilters.maxPrice || ""}
                  onChange={(e) => handlePriceChange(e, "maxPrice")}
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          {renderFilterOptions(
            "Rating",
            [
              { value: 4, label: "⭐ 4+ Stars" },
              { value: 4.5, label: "⭐ 4.5+ Stars" },
            ],
            "minRating",
            activeFilters,
            handleToggleFilter
          )}

          {/* Availability */}
          <div className="filter-section">
            <h4 className="filter-title">Availability</h4>
            {renderFilterOptions(
              "Availability",
              [
                { value: "sale", label: "🔥 On Sale" },
                { value: "new", label: "✨ New Arrivals" },
              ],
              "availability",
              activeFilters,
              handleToggleFilter
            )}
          </div>
        </div>

        {/* Mobile Footer (Apply Button) */}
        <div className="sidebar-footer" id="sidebar-footer">
          <button
            className="apply-filters-btn"
            id="apply-filters-btn"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
