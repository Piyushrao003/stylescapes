// frontend/src/components/admin/Layout.js

import React, { useState, useEffect } from 'react';
import AdminHeader from './Header'; // Import the prefixed Admin Header
import AdminFooter from './Footer'; // Import the prefixed Admin Footer
import '../../styles/admin/Layout.css'; // New CSS file for layout structure

const AdminLayout = ({ children, activePage }) => {
    // NOTE: In a production app, theme and auth status should come from React Context.
    const [theme, setTheme] = useState('dark-theme'); 
    const [isAuthenticated, setIsAuthenticated] = useState(true); // Assuming authenticated for admin access

    useEffect(() => {
        // Synchronize theme state with the global body class
        document.body.className = theme;
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme(prevTheme => prevTheme === 'dark-theme' ? 'light-theme' : 'dark-theme');
    };

    const handleLogout = () => {
        // 1. Clear authentication state/token
        // 2. Redirect to the admin login page
        console.log("Admin Logout triggered.");
        setIsAuthenticated(false);
        // window.location.href = '/admin/login'; // Redirect to login page
    };

    // If the user isn't authenticated (or lacks admin role), you would render a login/error screen.
    if (!isAuthenticated) {
        return (
            <div className="admin-auth-required-page">
                Please log in to access the Admin Panel.
            </div>
        );
    }

    return (
        <div className={`adx-page-container ${theme}`}>
            <AdminHeader 
                onLogout={handleLogout} 
                onThemeToggle={handleThemeToggle} // Pass the toggle function to the Header
            />
            
            <main className="adx-content-wrapper">
                {children}
            </main>

            <AdminFooter activePage={activePage} />
        </div>
    );
};

export default AdminLayout;
