// frontend/src/pages/AdminPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // *** CHANGED: Replaced useSearchParams with useLocation
// Import Admin Layout Wrapper
import AdminLayout from '../components/admin/Layout'; 
// Import Admin Components
import Dashboard from '../components/admin/Dashboard';
import OrdersAdmin from '../components/admin/OrdersAdmin';
import UsersDashboard from '../components/admin/UserDashboard';
import ProductManagement from '../components/admin/ProductManagement';
import Bill from '../components/admin/Bill'; // The Invoice Generator
import ProfileAdmin from '../components/admin/ProfileAdmin'; // The Alerts/Stats Page (Your last component)


const ADMIN_SECTIONS = {
    'dashboard': { component: Dashboard, title: 'Admin Dashboard' },
    'orders': { component: OrdersAdmin, title: 'Order Management' },
    'users': { component: UsersDashboard, title: 'User Management' },
    'products': { component: ProductManagement, title: 'Product Inventory' },
    'bill': { component: Bill, title: 'In-Store Billing & Receipts' },
    'profile': { component: ProfileAdmin, title: 'Admin Profile & Alerts' },
};

// Assuming the parent route (in App.js) is defined as: <Route path="/admin/:section" element={<AdminPage />} />
const AdminPage = ({ user, onUserLogout }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current URL path

    // --- NEW LOGIC: Determine the active section from the URL PATH ---
    const pathSegments = location.pathname.split('/');
    // Get the last segment (e.g., '/admin/orders' -> 'orders')
    let activeSection = pathSegments[pathSegments.length - 1] || 'dashboard';

    // Ensure the section exists, otherwise default to 'dashboard'
    if (!ADMIN_SECTIONS[activeSection]) {
        // If the route is just '/admin', navigate to '/admin/dashboard'
        if (pathSegments.length === 2 && pathSegments[1] === 'admin') {
             activeSection = 'dashboard';
        } else {
             // If a bad route segment is provided, fallback to dashboard
             activeSection = 'dashboard';
        }
    }
    // End NEW LOGIC

    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // --- 1. Admin Role Guard (CRITICAL for security) ---
    useEffect(() => {
        if (user) {
            if (user.role === 'admin' || user.role === 'superadmin') {
                setIsAdmin(true);
            } else {
                // If logged in but not an admin, redirect to homepage
                alert("Access Denied: You do not have administrative privileges.");
                navigate('/');
            }
        } else {
            // If not logged in, redirect to auth page (saving current location)
            navigate('/auth', { state: { from: window.location.pathname } });
        }
        setIsLoading(false);
    }, [user, navigate]);

    // --- 2. Render Content based on Section ---
    const renderActiveComponent = () => {
        // Use the path-derived activeSection to find the component
        const { component: Component, title } = ADMIN_SECTIONS[activeSection] || ADMIN_SECTIONS.dashboard;
        
        // The active section is now correctly identified via the URL path
        return (
            <div key={activeSection} className="admin-content-view">
                {/* Optional: Add a title display if the layout doesn't handle it */}
                {/* <h1>{title}</h1> */}
                <Component />
            </div>
        );
    };

    if (isLoading || !user) {
        return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-color)' }}>Verifying Admin Credentials...</div>;
    }

    if (!isAdmin) {
        return <div style={{ color: 'var(--danger-color)', textAlign: 'center', padding: '50px' }}>ACCESS FORBIDDEN.</div>;
    }


    return (
        // 3. Wrap the content with the Admin Layout
        <AdminLayout 
            activePage={activeSection} 
            onLogout={onUserLogout}
        >
            {renderActiveComponent()}
        </AdminLayout>
    );
};

export default AdminPage;