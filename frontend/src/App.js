// D:\stylescapes\frontend\src\App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import Auth from './pages/Auth';
import PolicyPage from './pages/PolicyPage'; 
import CollectionPage from './pages/CollectionPage'; 
import ProductDetail from './pages/ProductDetail'; 
import CartPage from './pages/CartPage'; 
import CheckoutPage from './pages/CheckoutPage'; 
// NEW: Import the functional pages
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrderPage';
// CRITICAL NEW IMPORT for Search Page
import SearchPage from './pages/SearchPage'; 

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
                    
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
