// D:\stylescapes\frontend\src\pages\CollectionPage.js

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "../api/productsApi";

import FilterSidebar from "../components/collection/FilterSidebar";
import CollectionHeader from "../components/collection/CollectionHeader";
import ProductGrid from "../components/collection/ProductGrid";

import "../styles/CollectionPage.css";
import "../styles/ProductCard.css";

const INITIAL_FILTERS = {
  categories: [],
  minPrice: null,
  maxPrice: null,
  minRating: null,
  availability: [],
};

const CollectionPage = ({ user }) => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilters, setActiveFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState("featured");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed (hidden)

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductsData();
  }, []);

  // Manage body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [sidebarOpen]);

  // Manage content wrapper margin based on sidebar state (desktop only)
  useEffect(() => {
    if (window.innerWidth >= 768) {
      if (!sidebarCollapsed && sidebarOpen) {
        document.body.classList.add("sidebar-open");
      } else {
        document.body.classList.remove("sidebar-open");
      }
    }

    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [sidebarCollapsed, sidebarOpen]);

  // --- Core Filter and Sort Logic ---

  const applyFiltersAndSort = useCallback(() => {
    setIsApplyingFilter(true);
    let tempProducts = [...products];
    const filters = activeFilters;

    tempProducts = tempProducts.filter((product) => {
      let matches = true;

      const productCategory = product.category || "clothing";
      const productPrice =
        product.price?.sale_price || product.price?.base_price || 0;
      const productRating = product.rating || 0;
      const isOnSale = product.price?.is_on_sale || false;
      const isNew =
        product.isNew ||
        new Date(product.created_at || "1970-01-01") >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (
        category &&
        category !== "all" &&
        productCategory.toLowerCase() !== category.toLowerCase()
      ) {
        matches = false;
      }
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(productCategory)
      ) {
        matches = false;
      }
      if (filters.minPrice !== null && productPrice < filters.minPrice) {
        matches = false;
      }
      if (filters.maxPrice !== null && productPrice > filters.maxPrice) {
        matches = false;
      }
      if (filters.minRating !== null && productRating < filters.minRating) {
        matches = false;
      }

      if (filters.availability.length > 0) {
        let hasRequiredAvailability = false;
        if (filters.availability.includes("new") && isNew) {
          hasRequiredAvailability = true;
        }
        if (filters.availability.includes("sale") && isOnSale) {
          hasRequiredAvailability = true;
        }
        if (!hasRequiredAvailability) matches = false;
      }

      return matches;
    });

    tempProducts.sort((a, b) => {
      const priceA = a.price?.sale_price || a.price?.base_price || 0;
      const priceB = b.price?.sale_price || b.price?.base_price || 0;
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      const dateA = new Date(a.created_at || "1970-01-01").getTime();
      const dateB = new Date(b.created_at || "1970-01-01").getTime();

      switch (sortBy) {
        case "price-low":
          return priceA - priceB;
        case "price-high":
          return priceB - priceA;
        case "rating":
          return ratingB - ratingA;
        case "newest":
          return dateB - dateA;
        default:
          return 0;
      }
    });

    setTimeout(() => {
      setFilteredProducts(tempProducts);
      setIsApplyingFilter(false);
    }, 300);
  }, [products, activeFilters, sortBy, category]);

  useEffect(() => {
    if (!isLoading) {
      applyFiltersAndSort();
    }
  }, [activeFilters, sortBy, isLoading, applyFiltersAndSort]);

  // --- Handlers ---

  const handleToggleFilter = (type, value) => {
    setActiveFilters((prev) => {
      let newFilters = { ...prev };
      if (type === "minRating") {
        newFilters.minRating = prev.minRating === value ? null : value;
      } else {
        newFilters[type] = prev[type].includes(value)
          ? prev[type].filter((v) => v !== value)
          : [...prev[type], value];
      }
      return newFilters;
    });
  };

  const handlePriceChange = (e, type) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setActiveFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleRemoveFilterTag = (type, value = null) => {
    if (type === "price") {
      setActiveFilters((prev) => ({ ...prev, minPrice: null, maxPrice: null }));
    } else if (type === "minRating") {
      setActiveFilters((prev) => ({ ...prev, minRating: null }));
    } else if (type === "categories" || type === "availability") {
      setActiveFilters((prev) => ({
        ...prev,
        [type]: prev[type].filter((v) => v !== value),
      }));
    }
  };

  const handleClearAllFilters = () => {
    setActiveFilters(INITIAL_FILTERS);
  };

  // FIXED: Hamburger button handler that opens sidebar
  const handleOpenSidebar = () => {
    setSidebarOpen(true);
    setSidebarCollapsed(false); // Also set collapsed to false when opening
  };

  const isFilterActive = Object.values(activeFilters).some(
    (value) =>
      (Array.isArray(value) && value.length > 0) ||
      (value !== null && !Array.isArray(value))
  );

  const getActiveFilterTags = () => {
    const tags = [];
    const filters = activeFilters;

    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice || "0";
      const max = filters.maxPrice || "∞";
      tags.push({ type: "price", value: "range", label: `₹${min} - ₹${max}` });
    }
    filters.categories.forEach((value) => {
      tags.push({
        type: "categories",
        value: value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
      });
    });
    if (filters.minRating !== null) {
      tags.push({
        type: "minRating",
        value: filters.minRating,
        label: `${filters.minRating}+ Stars`,
      });
    }
    filters.availability.forEach((value) => {
      const label = value === "sale" ? "On Sale" : "New Arrivals";
      tags.push({ type: "availability", value: value, label: label });
    });
    return tags;
  };

  return (
    <div className="collection-page-content-wrapper">
      <CollectionHeader
        productCount={filteredProducts.length}
        sortBy={sortBy}
        setSortBy={setSortBy}
        activeFilters={getActiveFilterTags()}
        onRemoveFilterTag={handleRemoveFilterTag}
        onOpenSidebar={handleOpenSidebar}
      />

      <FilterSidebar
        activeFilters={activeFilters}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        handleToggleFilter={handleToggleFilter}
        handlePriceChange={handlePriceChange}
        handleClearAllFilters={handleClearAllFilters}
        isFilterActive={isFilterActive}
      />

      <ProductGrid
        products={filteredProducts}
        isLoading={isLoading || isApplyingFilter}
        user={user}
      />
    </div>
  );
};

export default CollectionPage;