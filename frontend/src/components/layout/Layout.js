// D:\stylescapes\frontend\src\components\layout\Layout.js

import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header'; // Public Header
import Footer from './Footer'; // Public Footer
import AdminHeader from '../admin/Header'; // Admin Header
import AdminFooter from '../admin/Footer'; // Admin Footer

const Layout = ({ children, user, setUser }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    // Calculate cart count (placeholder - should come from context/state)
    const cartItemCount = 0;

    return (
        <div className={`app-container ${isAdminRoute ? 'admin-layout' : ''}`}>
            
            {/* 1. PUBLIC HEADER - Always renders (fixed at top) */}
            <Header 
                user={user} 
                setUser={setUser} 
                cartItemCount={cartItemCount} 
            />
            
            {/* 2. ADMIN HEADER - Only renders on admin routes (stacked below public header) */}
            {isAdminRoute && (
                <AdminHeader 
                    onLogout={() => setUser(null)} 
                />
            )}
            
            {/* 3. MAIN CONTENT - Adjust padding based on layout */}
            <main className={`main-content ${isAdminRoute ? 'has-admin-header' : ''}`}>
                {children}
            </main>
            
            {/* 4. FOOTER - Conditional rendering */}
            {isAdminRoute ? (
                <AdminFooter />
            ) : (
                <Footer />
            )}
            
        </div>
    );
};

export default Layout;