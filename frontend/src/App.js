// D:\stylescapes\frontend\src\App.js

import React, { useState, useEffect } from 'react';
// *** IMPORTANT: Import 'Navigate' for the redirect route ***
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import Auth from './pages/Auth';
import PolicyPage from './pages/PolicyPage'; 
import CollectionPage from './pages/CollectionPage'; 
import ProductDetail from './pages/ProductDetail'; 
import CartPage from './pages/CartPage'; 
import CheckoutPage from './pages/CheckoutPage'; 
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrderPage';
import SearchPage from './pages/SearchPage'; 
// NEW: Import the AdminPage component
import AdminPage from './pages/AdminPage'; 

import { getUserProfile } from './api/authApi'; 

import './styles/global.css';

function App() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 

    // --- CENTRALIZED HANDLER FOR USER STATE UPDATES (CRITICAL) ---
    /**
     * @description Updates the global user state (context) and localStorage after any successful action 
     * in the Profile section (e.g., changing name, addresses, or logging out).
     * @param {object|null} updatedUser - The new user object or null (for logout).
     */
    const handleUserUpdateSuccess = (updatedUser) => {
        if (updatedUser) {
            // Update global state and localStorage with the new profile data
            setUser(updatedUser); 
            localStorage.setItem('user', JSON.stringify(updatedUser)); 
        } else {
            // Handle Logout/Session Clear
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };
    // -----------------------------------------------------------------

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // This fetches the comprehensive user object (including addresses/wishlist)
                    const userData = await getUserProfile(token); 
                    handleUserUpdateSuccess(userData);
                } catch (error) {
                    console.error("Token verification failed:", error);
                    // Clear invalid session
                    handleUserUpdateSuccess(null);
                }
            }
            setIsLoading(false); 
        };
        fetchUserData();
    }, []); 

    if (isLoading) {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: 'white', backgroundColor: 'var(--bg-color)'}}>Loading Application...</div>; 
    }

    return (
        <Router>
            {/* Pass the centralized handler down to Layout/Header */}
            <Layout user={user} setUser={handleUserUpdateSuccess}>
                <Routes>
                    <Route path="/" element={<HomePage user={user} />} />
                    {/* Auth component uses the centralized handler */}
                    <Route path="/auth" element={<Auth setUser={handleUserUpdateSuccess} />} /> 
                    
                    {/* Public Routes */}
                    <Route path="/policies/:id?" element={<PolicyPage user={user} />} />
                    <Route path="/collections/:category?" element={<CollectionPage user={user} />} />
                    <Route path="/product/:id" element={<ProductDetail user={user} />} />
                    
                    {/* NEW SEARCH ROUTE INTEGRATION */}
                    <Route path="/search" element={<SearchPage user={user} />} />

                    {/* Cart/Checkout Routes */}
                    <Route path="/cart" element={<CartPage user={user} />} />
                    <Route path="/checkout" element={<CheckoutPage user={user} />} /> 
                    
                    {/* FINALIZED FUNCTIONAL PROFILE/ORDERS ROUTES */}
                    <Route 
                        path="/profile" 
                        element={<ProfilePage user={user} onUserUpdateSuccess={handleUserUpdateSuccess} />} 
                    />
                    <Route 
                        path="/orders" 
                        element={<OrdersPage user={user} />} 
                    />
                    
                    {/* ----------------------------------------------------------- */}
                    {/* --- ADMIN ROUTE FIX: Use two routes for path-based navigation --- */}
                    
                    {/* 1. Base Admin Route: Redirects /admin to /admin/dashboard */}
                    <Route 
                        path="/admin" 
                        element={<Navigate to="/admin/dashboard" replace />} 
                    />

                    {/* 2. Dynamic Admin Route: Matches /admin/dashboard, /admin/users, etc. */}
                    {/* The :section parameter is read by the updated AdminPage.js */}
                    <Route 
                        path="/admin/:section" 
                        element={<AdminPage user={user} onUserLogout={handleUserUpdateSuccess} />} 
                    />
                    {/* ----------------------------------------------------------- */}
                    
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;