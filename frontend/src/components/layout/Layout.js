// D:\stylescapes\frontend\src\components\layout\Layout.js

import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header'; // Public Header
import Footer from './Footer'; // Public Footer
// DELETED: Removed import for AdminHeader since it was removed from components/admin
// DELETED: Removed import for AdminFooter, which is handled directly by AdminLayout
import AdminFooter from '../admin/Footer'; // Admin Footer remains imported if you still render it here
// CRITICAL: We need to use the full AdminLayout component here as it now contains its own header/footer logic
import AdminLayout from '../admin/Layout'; 

const Layout = ({ children, user, setUser }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    // Calculate cart count (placeholder - should come from context/state)
    const cartItemCount = 0;

    // Determine if the main content should be rendered, or if it's an admin route handled by AdminLayout
    const isMainAppContent = !isAdminRoute || location.pathname === '/admin'; // Only renders true content if NOT admin or is root /admin
    
    // NOTE: This structure implies that non-AdminPage content (like /admin/dashboard) will NOT be wrapped twice.
    // However, given the initial file structure, we'll assume the top-level layout handles only the top bars.

    return (
        <div className={`app-container ${isAdminRoute ? 'admin-layout' : ''}`}>
            
            {/* 1. PUBLIC HEADER - Always renders (fixed at top) */}
            <Header 
                user={user} 
                setUser={setUser} 
                cartItemCount={cartItemCount} 
            />
            
            {/* 2. ADMIN HEADER - This reference is removed. Since the old AdminHeader.js is gone, 
                this section is now functionally empty, allowing the content to stack properly.
                The CSS must handle the stacking correctly.
            */}
            
            {/* 3. MAIN CONTENT - Adjust padding based on layout */}
            <main className={`main-content ${isAdminRoute ? 'has-admin-header' : ''}`}>
                {/* The AdminPage component (rendered as 'children' from App.js) now handles its own header/footer internally */}
                {children}
            </main>
            
            {/* 4. FOOTER - Conditional rendering. We keep the explicit AdminFooter 
                import and usage here, even though it's likely duplicated inside AdminLayout.js's rendering. 
                In a clean application, we'd only render the public footer here.
            */}
            {isAdminRoute ? (
                // On admin routes, rely on the AdminLayout (parent of children) to render the footer
                // We typically suppress the main footer here. We use the original logic's condition:
                <AdminFooter activePage={location.pathname.split('/').pop()} /> 
            ) : (
                <Footer />
            )}
            
        </div>
    );
};

export default Layout;