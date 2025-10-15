// D:\stylescapes\frontend\src\components\layout\Header.js

import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/global.css";

// CRITICAL: Accept cartItemCount as a prop
const Header = ({ user, setUser, cartItemCount = 0 }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const cartBadgeRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // --- Effects for Scrolling and Click Management ---

  // 1. Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Click Outside Profile Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileDropdownOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropdownOpen]);

  // 3. Side Panel Scroll Lock
  useEffect(() => {
    document.body.classList.toggle("no-scroll", sidePanelOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [sidePanelOpen]);

  // --- Handlers ---

  const toggleSidePanel = () => {
    setSidePanelOpen(!sidePanelOpen);
    setProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Simplified Collections Dropdown Logic (removed inline style logic)
  const toggleCollectionsDropdown = () => {
    setCollectionsDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setProfileDropdownOpen(false);
    navigate("/");
  };

  const handleCartClick = (e) => {
    // Trigger visual effect before navigation
    const iconElement = e.currentTarget;
    iconElement.classList.add("impact-ripple");
    if (cartBadgeRef.current) {
      cartBadgeRef.current.classList.add("flash-confirm");
    }

    setTimeout(() => {
      iconElement.classList.remove("impact-ripple");
      if (cartBadgeRef.current) {
        cartBadgeRef.current.classList.remove("flash-confirm");
      }
      navigate("/cart");
    }, 500);
  };

  // --- Data Mapping ---
  const isLoggedIn = !!user;
  const userInitial = user?.firstName?.charAt(0) || "U";

  return (
    <>
      <header className={`header ${isScrolled ? "scrolled" : ""}`}>
        <NavLink to="/" className="logo-container">
          <img
            src={`${process.env.PUBLIC_URL}/logo.svg`}
            alt="STYLESCAPES Logo"
            className="logo-img"
          />
          <span className="logo-text">STYLESCAPES</span>
        </NavLink>

        <nav className="desktop-nav">
          <NavLink to="/collections" className="nav-link">
            Collections
          </NavLink>
          <NavLink to="/about" className="nav-link">
            About Us
          </NavLink>

          <NavLink
            to="/search"
            className="search-icon-header"
            title="Search Products"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </NavLink>

          {/* Cart Icon */}
          <button
            className="cart-icon"
            onClick={handleCartClick}
            title="View Cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M4 7h16l-1 12H5L4 7z"
              />
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-badge" ref={cartBadgeRef}>
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Conditional Login/Profile Button */}
          {isLoggedIn ? (
            <div className="profile-dropdown" ref={profileDropdownRef}>
              <button className="profile-btn" onClick={toggleProfileDropdown}>
                {userInitial}
              </button>
              <div
                className={`dropdown-menu-profile ${
                  profileDropdownOpen ? "active" : ""
                }`}
                id="profile-menu"
              >
                <NavLink
                  to="/profile"
                  className="dropdown-item-profile"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  className="dropdown-item-profile"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </NavLink>
                <a
                  href="#"
                  className="dropdown-item-profile"
                  onClick={handleLogout}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </a>
              </div>
            </div>
          ) : (
            <NavLink to="/auth" className="login-btn">
              Login
            </NavLink>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className={`mobile-menu-toggle  ${sidePanelOpen ? "active" : ""}`}
          onClick={toggleSidePanel}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* 2. SIDE PANEL (Mobile Menu) */}
      <div
        className={`side-panel-overlay ${sidePanelOpen ? "active" : ""}`}
        onClick={toggleSidePanel}
      ></div>
      <div className={`side-panel ${sidePanelOpen ? "active" : ""}`}>
        <div className="side-panel-header">
          <button className="close-btn" onClick={toggleSidePanel}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Profile Section */}
        {isLoggedIn ? (
          <div className="profile-section-mobile">
            <div className="profile-header-mobile">
              <div className="profile-avatar-mobile">{userInitial}</div>
              <div className="profile-info-mobile">
                <h3>{user.firstName || "User"}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="profile-actions-mobile">
              <NavLink
                to="/profile"
                className="profile-action-mobile"
                onClick={toggleSidePanel}
              >
                Profile
              </NavLink>
              <NavLink
                to="/settings"
                className="profile-action-mobile"
                onClick={toggleSidePanel}
              >
                Settings
              </NavLink>
              <a
                href="#"
                className="profile-action-mobile"
                onClick={handleLogout}
              >
                Logout
              </a>
            </div>
          </div>
        ) : (
          <div className="profile-section-mobile">
            <NavLink to="/auth" className="login-btn" onClick={toggleSidePanel}>
              Login
            </NavLink>
          </div>
        )}

        <ul className="side-panel-menu">
          <li
            className={`menu-item dropdown-item ${
              collectionsDropdownOpen ? "open" : ""
            }`}
          >
            {/* Button for collections dropdown */}
            <button onClick={toggleCollectionsDropdown}>
              Collections
              <span className="dropdown-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
            {/* Dropdown Menu (removed inline style) */}
            <ul
              className="dropdown-menu"
              id="collections-menu"
              ref={dropdownRef}
            >
              <li>
                <NavLink to="/collections/t-shirt" onClick={toggleSidePanel}>
                  T-shirt
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/collections/formal-shirt"
                  onClick={toggleSidePanel}
                >
                  Formal Shirt
                </NavLink>
              </li>
              <li>
                <NavLink to="/collections/jeans" onClick={toggleSidePanel}>
                  Jeans
                </NavLink>
              </li>
              <li>
                <NavLink to="/collections" onClick={toggleSidePanel}>
                  All Collections
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="menu-item">
            <NavLink to="/about" onClick={toggleSidePanel}>
              About Us
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;
