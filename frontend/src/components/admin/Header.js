// D:/stylescapes/frontend/src/components/admin/Header.js

import React, { useState, useEffect } from 'react';
// Removed all external icon imports (lucide-react, @fortawesome)
import '../../styles/admin/Header.css';

// --- SVG ICON LIBRARY (Embedded) ---
const SunIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
);
const MoonIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>
);
const LogOutIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const UserIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);


const Header = ({ onLogout }) => {
  const [theme, setTheme] = useState('dark-theme');
  // Removed mock admin user data (const [adminUser] = useState(...) )

  useEffect(() => {
    // Applies the theme class globally to the body element
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => 
      prevTheme === 'dark-theme' ? 'light-theme' : 'dark-theme'
    );
  };
  
  const handleLogout = () => {
    console.log("Admin Logging Out...");
    // Future: Use Auth Context here to sign out
    if (onLogout) {
        onLogout();
    }
  };

  return (
    <header className="adh-header">
      <div className="adh-header-left">
        <div className="adh-logo-container">
          {/* Assuming logo.svg is in public folder */}
          <img src="/logo.svg" alt="Stylescapes Logo" className="adh-logo" /> 
          <span className="adh-logo-name">Stylescapes</span>
        </div>
      </div>
      <div className="adh-header-center">
        <div className="adh-admin-panel-heading">ADMIN PANEL</div>
      </div>
      <div className="adh-header-right">
        {/* Admin User Info - Placeholder for real context data (e.g., from Firebase Auth) */}
        <div className="adh-user-info">
            <UserIcon className="adh-user-icon"/>
            <span className="adh-user-name">Admin</span> 
        </div>
        
        {/* Logout Button */}
        <button 
          className="adh-icon-button adh-logout-button" 
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOutIcon />
        </button>

        {/* Theme Toggle Button */}
        <button 
          className="adh-icon-button adh-theme-toggle-button" 
          onClick={toggleTheme}
          aria-label={theme === 'dark-theme' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark-theme' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
};

export default Header;