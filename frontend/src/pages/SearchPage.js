import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getProducts } from "../api/productsApi";
// Import the local utility class
import { searchEngineUtility } from "../components/Search/SearchEngineUtility";
import ProductGrid from "../components/collection/ProductGrid";
import { useNavigate } from "react-router-dom";

import "../styles/search.css";

// --- Local Utility: Debounce Function ---
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

// --- Local Utility: Determine Current Season ---
const getSeason = () => {
  const month = new Date().getMonth(); // 0 (Jan) to 11 (Dec)
  // April (3) through October (9) is roughly the Summer/Monsoon season.
  if (month >= 3 && month <= 9) {
    return "summer";
  }
  return "winter";
};

const SearchPage = ({ user }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState("all");
  const [currentQuickFilter, setCurrentQuickFilter] = useState("all");

  const navigate = useNavigate();
  const currentSeason = useMemo(getSeason, []);

  // Memoize the utility instance for consistent use
  const searchEngine = useMemo(() => searchEngineUtility, []);

  // --- 1. Fetch All Products (Runs Once on Load) ---
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const data = await getProducts();
        setAllProducts(data);

        // Set initial suggestions based on season immediately after fetch
        setSearchResults(getInitialSuggestions(data, currentSeason));
      } catch (error) {
        console.error("Error fetching all products for search:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllProducts();
  }, [currentSeason]);

  // --- 2. Seasonal Prioritization Logic ---
  const getInitialSuggestions = useCallback(
    (products, season) => {
      // Find keywords relevant to the current season
      const seasonalKeywords = Object.entries(searchEngine.categoryMappings)
        .filter(([key, map]) => map.season === season)
        .flatMap(([key, map]) => [key, ...map.keywords]);

      if (seasonalKeywords.length === 0) return products.slice(0, 20);

      // Filter products that contain any seasonal keyword in their category or style
      const suggestions = products.filter((product) => {
        const normalizedCategory = searchEngine.normalizeQuery(
          product.category || ""
        );
        const normalizedStyle = searchEngine.normalizeQuery(
          product.style || ""
        );
        const normalizedName = searchEngine.normalizeQuery(
          product.product_name || ""
        );

        return seasonalKeywords.some((keyword) => {
          const normalizedKeyword = searchEngine.normalizeQuery(keyword);
          return (
            normalizedCategory.includes(normalizedKeyword) ||
            normalizedStyle.includes(normalizedKeyword) ||
            normalizedName.includes(normalizedKeyword)
          );
        });
      });

      // Prioritize by rating or sales (simple descending sort for UX)
      suggestions.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      // Display a maximum of 20 high-priority suggestions
      return suggestions.slice(0, 20);
    },
    [searchEngine]
  );

  // --- 3. Core Search Function and Debounce Logic ---
  const executeSearch = useCallback(
    (query, categoryFilter, quickFilter) => {
      let results = [];

      if (query) {
        // Tiered search on all products using the utility
        results = searchEngine.search(query, allProducts);
      } else {
        // If query is empty, revert to seasonal suggestions
        results = getInitialSuggestions(allProducts, currentSeason);
      }

      // Apply quick filter on the results set
      if (quickFilter !== "all") {
        const allowedCategories =
          searchEngine.quickFilterMappings[quickFilter] || [];
        results = results.filter((p) => allowedCategories.includes(p.category));
      }

      // Apply explicit category filter
      if (categoryFilter !== "all") {
        results = results.filter((p) => p.category === categoryFilter);
      }

      setSearchResults(results);
    },
    [allProducts, searchEngine, currentSeason, getInitialSuggestions]
  );

  // Debounced function called by the search input change
  const debouncedSearch = useMemo(
    () => debounce(executeSearch, 300),
    [executeSearch]
  );

  // --- Handlers ---
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value, currentCategoryFilter, currentQuickFilter);
  };

  const handleCategoryClick = (category) => {
    setCurrentCategoryFilter(category);
    executeSearch(searchTerm, category, currentQuickFilter);
  };

  const handleQuickFilterClick = (filter) => {
    setCurrentQuickFilter(filter);
    // Reset category filter if a specific quick filter is chosen
    setCurrentCategoryFilter("all");
    executeSearch(searchTerm, "all", filter);
  };

  // --- JSX RENDER ---

  // Define the primary category chips (keys from the SearchEngineUtility)
  const PRIMARY_CATEGORIES = Object.keys(searchEngine.categoryMappings);


  const resultsCountText = searchTerm
    ? `Showing ${searchResults.length} results for "${searchTerm}"`
    : `Showing ${
        searchResults.length
      } ${currentSeason.toUpperCase()} Suggestions`;

  return (
    <div className="search-page-wrapper">
      <div className="container">
        {/* Search Bar Section */}
        <div className="search-container" id="searchContainer">
          <div className="search-wrapper">
            <input
              type="text"
              id="searchInput"
              className="search-input"
              placeholder="Search by product name, style, or type..."
              value={searchTerm}
              onChange={handleInputChange}
            />
            <button
              className="search-button"
              onClick={() =>
                executeSearch(
                  searchTerm,
                  currentCategoryFilter,
                  currentQuickFilter
                )
              }
            >
              <svg
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          <div className="search-insights">
            <p className="search-results-count">{resultsCountText}</p>
          </div>
        </div>

       

        {/* Category Chip Filters */}
        <div className="category-chips">
          {PRIMARY_CATEGORIES.map((category) => (
            <button
              key={category}
              className={`chip ${
                currentCategoryFilter === category ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {searchEngine.categoryMappings[category].display}
            </button>
          ))}
        </div>

        {/* Results Grid / Loading State */}
        {isLoading ? (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-info">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line price"></div>
                  <div className="skeleton-line rating"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={searchResults} isLoading={false} user={user} />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
