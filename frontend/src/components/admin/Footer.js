// frontend/src/components/admin/Footer.js

import React from 'react';
import { NavLink } from 'react-router-dom';
// Ensure this path correctly points to the Footer CSS for admin styles (adf- classes)
import '../../styles/admin/Footer.css'; 

/* * PlaceholderIcon Component: Corrected JSX structure to wrap all 
 * adjacent SVG elements in a React Fragment (<>...</>) to resolve the parsing error.
 */
const PlaceholderIcon = ({ name }) => (
    <svg className="adf-tab-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        
        {name === 'dashboard' && <path d="M3 3v18h18M18 17l-3-3-4 4-5-5" />}
        
        {name === 'orders' && (<>
            <circle cx="10" cy="20" r="1" /><circle cx="17" cy="20" r="1" /><path d="M1 1h4l2.68 12.09a2 2 0 0 0 2 1.91h8.64a2 2 0 0 0 2-1.91L23 6H6" />
        </>)}
        
        {name === 'users' && (<>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </>)}
        
        {/* === FIX APPLIED HERE === */}
        {name === 'products' && (<>
            <rect x="1" y="3" width="22" height="18" rx="2" ry="2"/><path d="M11 7L11 17M7 11L15 11" />
        </>)}

        {/* === FIX APPLIED HERE === */}
        {name === 'bill' && (<>
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/><path d="M16 13L8 13M16 17L8 17" />
        </>)}
        
        {/* === FIX APPLIED HERE === */}
        {name === 'profile' && (<>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </>)}

    </svg>
);


const navItems = [
    // Direct paths used for robust, simple navigation, aligned with updated AdminPage.js
    { key: 'dashboard', label: 'Dashboard', iconName: 'dashboard', to: '/admin/dashboard' },
    { key: 'orders', label: 'Orders', iconName: 'orders', to: '/admin/orders' },
    { key: 'users', label: 'Users', iconName: 'users', to: '/admin/users' },
    { key: 'products', label: 'Products', iconName: 'products', to: '/admin/products' },
    { key: 'bill', label: 'Billing', iconName: 'bill', to: '/admin/bill' },
    { key: 'profile', label: 'Profile', iconName: 'profile', to: '/admin/profile' },
];

const Footer = () => {
    return (
        <footer className="adf-footer">
            <ul className="adf-nav-list">
                {navItems.map((item) => (
                    <li key={item.key}>
                        <NavLink
                            to={item.to}
                            className={({ isActive }) => 
                                `adf-tab-link ${isActive ? 'active' : ''}`
                            }
                            aria-label={`Go to ${item.label}`}
                        >
                            <PlaceholderIcon name={item.iconName} />
                            <span className="adf-tab-label">{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </footer>
    );
};

export default Footer;