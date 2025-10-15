// File Path: frontend/src/pages/HomePage.js

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate and Link for routing
import { getProducts, getRandomProducts } from "../api/productsApi";
// Assuming ProductCard component will be reused here for consistent styling
import ProductCard from "../components/collection/ProductCard";

// CRITICAL NOTE: The CSS for .hero, .brand-story, etc., is still in global.css
// and needs to be treated as such for layout purposes.

const HomePage = ({ user }) => {
  // Assuming user prop is available from App.js
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define the hard limit for products displayed on the homepage
  const PRODUCT_LIMIT = 50;

  // --- Data Fetching ---
  useEffect(() => {
    // Fetch a random selection of products from the backend (up to 50)
    const fetchFeaturedProducts = async () => {
      try {
        // FIX 3: Set a limiter for the fetched products
        // We use getProducts here to potentially apply filtering/sorting on all products later
        const allData = await getProducts();

        // Shuffle and limit locally to 50 (or less) if API doesn't support random limits
        const shuffledData = allData.sort(() => 0.5 - Math.random());
        const limitedData = shuffledData.slice(0, PRODUCT_LIMIT);

        setFeaturedProducts(limitedData);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();

    // Floating elements animation logic (remains the same)
    const createFloatingElement = () => {
      const floatingContainer = document.getElementById("floating-elements");
      if (!floatingContainer) return;
      const element = document.createElement("div");
      element.classList.add("floating-element");
      element.style.left = Math.random() * 100 + "vw";
      element.style.animationDuration = Math.random() * 3 + 4 + "s";
      element.style.animationDelay = Math.random() * 2 + "s";
      floatingContainer.appendChild(element);

      setTimeout(() => {
        element.remove();
      }, 8000);
    };

    const floatingInterval = setInterval(createFloatingElement, 800);

    return () => clearInterval(floatingInterval);
  }, []);

  const renderStars = (rating) => {
    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return "☆☆☆☆☆";
    }
    const fullStars = "★".repeat(Math.floor(rating));
    const emptyStars = "☆".repeat(5 - Math.floor(rating));
    return `${fullStars}${emptyStars}`;
  };

  // Handler for card click to redirect
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="floating-elements" id="floating-elements"></div>
        <div className="hero-content">
          <h1 className="hero-title">Elevate Your Style</h1>
          <p className="hero-subtitle">
            Quality clothing you can trust, styles you'll love
          </p>

          {/* FIX 1: Redirect to CollectionPage (e.g., /collections) */}
          <Link to="/collections" className="shop-btn">
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Featured Product Section (Remains in the middle, as per standard UX flow) */}
      <section className="featured-product-section" id="products">
        <h2 className="section-title">Featured Collection</h2>
        <div className="product-grid">
          {loading ? (
            <p>Loading products...</p>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              // FIX 2: Use ProductCard component and set key/handler correctly
              <ProductCard
                key={product.id || product.uid}
                product={product}
                user={user} // Pass user status for wishlist
                onClick={() => handleProductClick(product.id || product.uid)}
              />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </section>

      {/* NEW: Promotional Banners Section */}
      <section className="promo-banners-section">
        <div className="promo-banners-grid">
          {/* Banner 1: Formal Shirts */}
          <div className="promo-banner-card">
            <img
              src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=2940&auto=format&fit=crop"
              alt="Formal Shirts Collection"
              className="promo-banner-image"
            />
            <div className="promo-banner-overlay">
              <div className="promo-banner-content">
                <h3 className="promo-banner-title">FORMAL ELEGANCE</h3>
                <p className="promo-banner-subtitle">
                  Refined shirts for the modern professional
                </p>
                <Link to="/collections/Shirt" className="promo-explore-btn">
                  EXPLORE NOW
                </Link>
              </div>
            </div>
          </div>

          {/* Banner 2: T-Shirts */}
          <div className="promo-banner-card">
            <img
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2940&auto=format&fit=crop"
              alt="T-Shirts Collection"
              className="promo-banner-image"
            />
            <div className="promo-banner-overlay">
              <div className="promo-banner-content">
                <h3 className="promo-banner-title">CASUAL COMFORT</h3>
                <p className="promo-banner-subtitle">
                  Classic t-shirts that never go out of style
                </p>
                <Link to="/collections/T-Shirt" className="promo-explore-btn">
                  EXPLORE NOW
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIX 4: Relocated Brand Story Section (Now just above the Newsletter) */}
      <section className="brand-story">
        <div className="brand-content">
          <h2 className="brand-title">Our Story Begins</h2>
          <p className="brand-description">
            STYLESCAPES started with a passion for modern menswear and a
            commitment to quality you can trust. We're a fresh brand focused on
            creating stylish, comfortable clothing that fits your lifestyle.
            Every piece is carefully selected to bring you the perfect balance
            of contemporary design and everyday comfort.
          </p>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">5K+</div>
              <div className="stat-label">Early Supporters</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Curated Pieces</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Quality Assurance</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Customer Love</div>
            </div>
          </div>
        </div>
      </section>
      {/* NEW: Second Promotional Banners Section - Jeans & Formal Pants */}
      <section className="promo-banners-section promo-banners-secondary">
        <div className="promo-banners-grid">
          {/* Banner 3: Jeans */}
          <div className="promo-banner-card">
            <img
              src="https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2926&auto=format&fit=crop"
              alt="Jeans Collection"
              className="promo-banner-image"
            />
            <div className="promo-banner-overlay">
              <div className="promo-banner-content">
                <h3 className="promo-banner-title">DENIM PERFECTION</h3>
                <p className="promo-banner-subtitle">
                  Premium jeans crafted for comfort and style
                </p>
                <Link to="/collections/Jeans" className="promo-explore-btn">
                  EXPLORE NOW
                </Link>
              </div>
            </div>
          </div>

          {/* Banner 4: Formal Pants */}
          <div className="promo-banner-card">
            <img
              src="https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=2787&auto=format&fit=crop"
              alt="Formal Pants Collection"
              className="promo-banner-image"
            />
            <div className="promo-banner-overlay">
              <div className="promo-banner-content">
                <h3 className="promo-banner-title">TAILORED EXCELLENCE</h3>
                <p className="promo-banner-subtitle">
                  Sharp formal pants for the modern gentleman
                </p>
                <Link
                  to="/collections/Formal-Pants"
                  className="promo-explore-btn"
                >
                  EXPLORE NOW
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
