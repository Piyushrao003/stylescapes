// frontend/src/components/Account/ProfileSidebar.js

import React, { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import "../../styles/ProfileSidebar.css";

// --- Icon Helper Component ---
// Renamed icon class to 'psp-sidebar-icon'
const Icon = ({ path, viewBox = "0 0 24 24" }) => (
  <svg
    className="psp-sidebar-icon"
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {path.map((d, i) => (
      <path key={i} d={d} />
    ))}
  </svg>
);

// --- Icon Definitions (No change in paths) ---
const ProfileIcon = () => (
  <Icon
    path={[
      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2",
      "M12 7a4 4 0 100-8 4 4 0 000 8z",
    ]}
  />
);

const OrdersIcon = () => (
  <Icon
    path={[
      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
      "M14 2L14 8 20 8",
    ]}
  />
);

const WishlistIcon = () => (
  <Icon
    path={[
      "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
    ]}
  />
);

const AddressesIcon = () => (
  <Icon
    path={[
      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z",
      "M12 10a3 3 0 100-6 3 3 0 000 6z",
    ]}
  />
);

const SettingsIcon = () => (
  <Icon
    path={[
      "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
      "M12 12a3 3 0 100-6 3 3 0 000 6z",
    ]}
  />
);

const ProfileSidebar = ({
  user,
  activeSection,
  setActiveSection,
  onLogout,
}) => {
  const userDisplayName = user?.firstName || "User";
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  // Use useCallback for stable function reference
  const handleLinkClick = useCallback(
    (sectionId) => {
      setActiveSection(sectionId);
      // Collapse mobile menu if screen is small
      if (window.innerWidth <= 768) {
        toggleSidebar();
      }
    },
    [setActiveSection]
  );

  // Simplifies NavLink click for the /orders route
  const handleNavigationClick = useCallback(() => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
    // NavLink handles the actual routing
  }, []);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button className="psp-hamburger-btn" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`psp-side-panel-overlay ${isMobileOpen ? "psp-active" : ""}`}
        onClick={toggleSidebar}
      ></div>

      {/* Main Sidebar Panel */}
      <div className={`psp-side-panel ${isMobileOpen ? "psp-active" : ""}`}>
        <div className="psp-sidebar-header">
          <div className="psp-sidebar-logo">STYLESCAPES</div>
          <div className="psp-sidebar-user">
            Welcome back, {userDisplayName}!
          </div>
        </div>

        <ul className="psp-sidebar-menu">
          <li className="psp-sidebar-item">
            {/* Use NavLink with isActive for proper highlighting and accessibility */}
            <NavLink
              to="/profile"
              className={`psp-sidebar-link ${
                activeSection === "profile" ? "psp-active" : ""
              }`}
              onClick={() => handleLinkClick("profile")}
            >
              <ProfileIcon /> Profile
            </NavLink>
          </li>

          <li className="psp-sidebar-item" data-hide-mobile="true">
            {/* NavLink for Orders, simplified click handler */}
            <NavLink
              to="/orders"
              className="psp-sidebar-link"
              onClick={handleNavigationClick}
            >
              <OrdersIcon /> Orders
            </NavLink>
          </li>

          <li className="psp-sidebar-item">
            {/* NavLink usage for section changes */}
            <NavLink
              to="/profile?section=wishlist"
              className={`psp-sidebar-link ${
                activeSection === "wishlist" ? "psp-active" : ""
              }`}
              onClick={() => handleLinkClick("wishlist")}
            >
              <WishlistIcon /> Wishlist
            </NavLink>
          </li>

          <li className="psp-sidebar-item">
            <NavLink
              to="/profile?section=addresses"
              className={`psp-sidebar-link ${
                activeSection === "addresses" ? "psp-active" : ""
              }`}
              onClick={() => handleLinkClick("addresses")}
            >
              <AddressesIcon /> Addresses
            </NavLink>
          </li>

          <li className="psp-sidebar-item">
            <NavLink
              to="/profile?section=settings"
              className={`psp-sidebar-link ${
                activeSection === "settings" ? "psp-active" : ""
              }`}
              onClick={() => handleLinkClick("settings")}
            >
              <SettingsIcon /> Settings
            </NavLink>
          </li>
        </ul>

        <button className="psp-logout-btn-sidebar" onClick={onLogout}>
          Logout
        </button>
      </div>
    </>
  );
};

export default ProfileSidebar;
