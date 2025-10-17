// frontend/src/components/admin/Layout.js

import React, { useState, useEffect } from 'react';
// Header imports and logic are now completely removed.
import AdminFooter from './Footer'; // Import the prefixed Admin Footer
import '../../styles/admin/Layout.css'; 
// NOTE: Ensure your calling component (AdminPage.js) and its parent 
// (Layout.js) now provide the necessary fixed header element!

const AdminLayout = ({ children, activePage, onLogout }) => {
    // Theme state remains local only to correctly apply the class to the div
    const [theme, setTheme] = useState('dark-theme'); 

    useEffect(() => {
        // Synchronize theme state with the global body class for consistent theme application
        document.body.className = theme;
        
        // Cleanup function to avoid leaving a class when component unmounts
        return () => {
             document.body.className = '';
        };
    }, [theme]);

    // The toggleTheme function is now redundant unless you add a theme switch back to the layout.
    // const toggleTheme = () => {
    //     setTheme(prevTheme => prevTheme === 'dark-theme' ? 'light-theme' : 'dark-theme');
    // };

    return (
        <div className={`adx-page-container ${theme}`}>
            
            {/* The Admin Header has been COMPLETELY REMOVED from this file. 
                The content now begins immediately. */}
            
            <main className="adx-content-wrapper">
                {children}
            </main>

            <AdminFooter activePage={activePage} />
        </div>
    );
};

export default AdminLayout;