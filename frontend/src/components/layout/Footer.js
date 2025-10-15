// D:\stylescapes\frontend\src\components\layout\Footer.js

import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../../styles/global.css"; // Global CSS contains all the necessary styles

const Footer = () => {
  return (
    <>
      {/* 1. Desktop Footer (Visible on screens >= 769px) */}
      <footer className="desktop-footer">
        <div className="footer-separator"></div>

        <div className="footer-content">
          {/* Brand Info Column */}
          <div className="footer-col brand-info">
            <Link to="/" className="brand-logo-container">
              <img
                src="/logo.svg"
                alt="STYLESCAPES Logo"
                className="brand-logo-img"
              />
              <span className="brand-logo-text">STYLESCAPES</span>
            </Link>
            <p>
              Where modern design meets timeless quality. Discover the perfect
              look for every landscape in your life.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col quick-links">
            <h4>Discover Style</h4>
            <ul>
              <li>
                <Link to="/collections">Trending Now</Link>
              </li>
              <li>
                <Link to="/collections">New Arrivals</Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal Column */}
          <div className="footer-col legal-support">
            <h4>Support & Legal</h4>
            <ul>
              <li>
                <Link to="/support">Customer Support</Link>
              </li>
              <li>
                <Link to="/policies/shipping">Shipping & Returns</Link>
              </li>
              <li>
                <Link to="/policies/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/policies/terms">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Social & Connect Column */}
          <div className="footer-col social-connect">
            <h4>Connect With Us</h4>
            {/* Newsletter Form Simulation */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Subscribed!");
              }}
              style={{ marginBottom: "1.5rem" }}
            >
              <input
                type="email"
                placeholder="Email for updates"
                className="newsletter-input-footer"
              />
              <button type="submit" className="subscribe-btn-footer">
                Subscribe
              </button>
            </form>

            <div className="social-icons">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-link"
                aria-label="Follow us on Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* X (Twitter) */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                class="social-icon-link"
                aria-label="Follow us on X (Twitter)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c11 3 21 0 21-11.15v-1a4.84 4.84 0 0 0 1.65-1.76z"></path>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                class="social-icon-link"
                aria-label="Subscribe on YouTube"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2A54.48 54.48 0 0 0 12 4c-2.7 0-5.3.2-7.85.42a2.78 2.78 0 0 0-1.94 2A29.58 29.58 0 0 0 2 12a29.58 29.58 0 0 0 .25 5.58 2.78 2.78 0 0 0 1.94 2A54.48 54.48 0 0 0 12 20c2.7 0 5.3-.2 7.85-.42a2.78 2.78 0 0 0 1.94-2A29.58 29.58 0 0 0 22 12a29.58 29.58 0 0 0-.25-5.58z"></path>
                  <polygon points="10 15 15 12 10 9 10 15"></polygon>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          &copy; 2025 STYLESCAPES. All rights reserved.
        </div>
      </footer>

      {/* 2. Mobile Footer (Visible on screens <= 768px) - Uses NavLink for active state */}
      <nav className="tab-bar-footer">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `tab-item home-tab ${isActive ? "active" : ""}`
          }
        >
          <img className="tab-icon" src="./Images/home.png" alt="Home Icon" />
          <span className="tab-label">Home</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `tab-item search-tab ${isActive ? "active" : ""}`
          }
        >
          <img class="tab-icon" src="./Images/search.png" alt="Search Icon" />
          <span className="tab-label">Search</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `tab-item cart-tab ${isActive ? "active" : ""}`
          }
        >
          <img class="tab-icon" src="./Images/cart.gif" alt="Cart Icon" />
          <span className="tab-label">Cart</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `tab-item orders-tab ${isActive ? "active" : ""}`
          }
        >
          <img class="tab-icon" src="./Images/order.png" alt="Orders Icon" />
          <span className="tab-label">Orders</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `tab-item account-tab ${isActive ? "active" : ""}`
          }
        >
          <img class="tab-icon" src="./Images/account.png" alt="Account Icon" />
          <span className="tab-label">Account</span>
        </NavLink>
      </nav>

      <button className="chatbot-fab">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--primary-bg)" }}
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </>
  );
};

export default Footer;
