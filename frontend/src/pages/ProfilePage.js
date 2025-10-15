// frontend/src/pages/ProfilePage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import ProfileSidebar from '../components/Account/ProfileSidebar.js';
import ProfileDetails from '../components/Account/ProfileDetails.js';
import AddressManager from '../components/Account/AddressManager.js';
import SettingsManager from '../components/Account/SettingsManager.js';
import WishlistManager from '../components/Account/WishlistManager.js';

import { getUserProfile } from '../api/userApi'; 

import '../styles/ProfilePage.css';

const ProfilePage = ({ user, onUserUpdateSuccess }) => {
    
    // --- State and Hooks ---
    const [searchParams, setSearchParams] = useSearchParams();
    const [userProfileData, setUserProfileData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Determine the active section from the URL, defaulting to 'profile'
    const activeSection = searchParams.get('section') || 'profile';

    // Function to change the active section (updates URL)
    const setActiveSection = useCallback((sectionId) => {
        setSearchParams({ section: sectionId });
    }, [setSearchParams]);


    // --- Data Fetching (Initial Load and Global Sync) ---
    const fetchProfileData = useCallback(async () => {
        if (!token || !user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Fetch comprehensive user data (including addresses/wishlist)
            const data = await getUserProfile(token);
            
            setUserProfileData({
                ...data,
                // Ensure name fields are present for UI components
                firstName: data.firstName || '',
                lastName: data.lastName || '',
            });

        } catch (error) {
            console.error("Failed to fetch detailed profile data:", error);
            // If fetch fails, force log out via the centralized App.js handler
            onUserUpdateSuccess(null); 
        } finally {
            setIsLoading(false);
        }
    }, [user, token, onUserUpdateSuccess]);

    useEffect(() => {
        if (user) {
            fetchProfileData();
        } else {
            setIsLoading(false);
        }
    }, [user, fetchProfileData]);

    // Handler passed to child components (ProfileDetails, AddressManager, WishlistManager) 
    // to update local state and sync App.js/localStorage
    const handleUserUpdateSuccess = useCallback((updatedFields) => {
        if (userProfileData) {
            // Merge updated fields (e.g., { addresses: [...] } or { firstName: '...' })
            const updatedData = { ...userProfileData, ...updatedFields };
            setUserProfileData(updatedData);
            
            // Sync up to the global App.js state
            onUserUpdateSuccess(updatedData); 
        }
    }, [userProfileData, onUserUpdateSuccess]);

    const handleLogout = () => {
        onUserUpdateSuccess(null); // Clear user state and token globally
        navigate('/'); // Redirect to homepage
    };
    
    // --- Conditional Render: Not Logged In ---
    if (!user && !isLoading) {
        return (
            <div className="pp-profile-page-wrapper">
                <div className="pp-container pp-auth-card-wrapper">
                    <div className="pp-auth-card">
                        <div className="pp-auth-card-icon">👤</div> 
                        <h2>Please Log In</h2>
                        <p>You must log in to view and manage your account details.</p>
                        <button onClick={() => navigate('/auth', { state: { from: '/profile' } })} className="pp-btn-browse">
                            Log In / Register
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Conditional Render: Loading State ---
    if (isLoading || !userProfileData) {
        return (
            <div className="pp-profile-page-wrapper">
                <div className="pp-loading-state">Loading user profile...</div>
            </div>
        );
    }

    // --- Render Content Based on Active Section ---
    const renderContent = () => {
        const commonProps = { user: userProfileData, onUserUpdateSuccess: handleUserUpdateSuccess };

        switch (activeSection) {
            case 'profile':
                return <ProfileDetails {...commonProps} />;
            case 'addresses':
                return <AddressManager {...commonProps} />;
            case 'wishlist':
                return <WishlistManager {...commonProps} />;
            case 'settings':
                // SettingsManager needs the global logout handler directly
                return <SettingsManager {...commonProps} onUserLogout={handleLogout} />;
            default:
                return <ProfileDetails {...commonProps} />;
        }
    };

    return (
        <div className="pp-profile-page-wrapper">
            <div className="pp-container">
                {/* Left Column: Sidebar Navigation (Passed the URL-aware activeSection prop) */}
                <div className="pp-sidebar-column">
                    <ProfileSidebar 
                        user={userProfileData} 
                        activeSection={activeSection} 
                        setActiveSection={setActiveSection} 
                        onLogout={handleLogout} 
                    />
                </div>
                
                {/* Right Column: Content Area */}
                <div className="pp-content-column">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;