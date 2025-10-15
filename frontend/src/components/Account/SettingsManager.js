// frontend/src/components/Account/SettingsManager.js

import React, { useState, useCallback, useEffect } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../config/firebase'; // Assuming 'auth' instance is exported from firebase config
import '../../styles/SettingsManager.css'; 
import '../../styles/AuthComp.css'; // Importing for global icon styles

// --- Toggle Switch Component Helper (Unchanged) ---
const ToggleSwitch = ({ id, checked, onChange, disabled }) => (
    <label className="stg-toggle-switch">
        <input 
            type="checkbox" 
            id={id} 
            checked={checked} 
            onChange={onChange} 
            disabled={disabled}
        />
        <span className="stg-slider"></span>
    </label>
);

const SettingsManager = ({ user, onUserLogout }) => {
    
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [settingsError, setSettingsError] = useState(null);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Initial preferences state (Unchanged)
    const [preferences, setPreferences] = useState({
        promotionalEmails: user?.settings?.promotionalEmails ?? true,
        orderUpdatesSMS: user?.settings?.orderUpdatesSMS ?? true,
        newArrivals: user?.settings?.newArrivals ?? false,
        priceDropAlerts: user?.settings?.priceDropAlerts ?? true,
        personalizedRecommendations: user?.settings?.personalizedRecommendations ?? true,
        marketingCookies: user?.settings?.marketingCookies ?? false,
        clearOldSessions: user?.settings?.clearOldSessions ?? true,
    });
    
    const openPasswordModal = () => setIsPasswordModalOpen(true);
    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSettingsError(null); // Clear error on close
    };

    const handlePasswordChange = (field, value) => {
        setPasswordForm(prev => ({ ...prev, [field]: value }));
        setSettingsError(null); // Clear error when typing
    };
    
    const togglePassVisibility = (field) => {
        if (field === 'current') setShowCurrentPass(prev => !prev);
        if (field === 'new') setShowNewPass(prev => !prev);
        if (field === 'confirm') setShowConfirmPass(prev => !prev);
    };

    // --- CRITICAL: Client-Side Password Update Logic with Re-authentication ---
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setSettingsError(null);

        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        if (newPassword !== confirmPassword) {
            setSettingsError('New passwords do not match!');
            return;
        }
        if (newPassword.length < 6) {
            setSettingsError('New password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);

        const currentUser = auth.currentUser;
        if (!currentUser || !currentUser.email) {
            setSettingsError("User session error. Please log out and log in again.");
            setIsLoading(false);
            return;
        }

        try {
            // 1. RE-AUTHENTICATE (Security step)
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // 2. UPDATE PASSWORD
            await updatePassword(currentUser, newPassword);

            // 3. SUCCESS & FORCED LOGOUT
            alert('Password updated successfully! You must now log in with your new password.');
            closePasswordModal();
            onUserLogout(); 

        } catch (error) {
            console.error("Password Update Error:", error);
            let errorMessage = 'Password update failed. ';

            if (error.code === 'auth/wrong-password') {
                errorMessage = 'The current password you entered is incorrect.';
            } else if (error.code === 'auth/user-mismatch' || error.code === 'auth/user-not-found') {
                errorMessage = 'Session expired. Please log out and sign in again.';
            } else {
                 errorMessage += 'Please re-check your passwords.';
            }
            setSettingsError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Preference Toggle Logic (Optimistic UI Update + Backend Reminder) ---
    const handleToggleChange = useCallback((e) => {
        const { id, checked } = e.target;
        
        setPreferences(prev => ({ ...prev, [id]: checked }));
        console.log(`Setting '${id}' toggled to ${checked}. A PUT API call is required to persist this change to the backend.`);
        
    }, []);
    
    // --- Session Management Logic (Calls Backend API via User Service) ---
    const handleSignOutAll = () => {
        if (window.confirm('Are you sure you want to sign out from all devices? This will invalidate all active sessions.')) {
            console.log("Simulated API Call: Revoking all Firebase refresh tokens via backend.");
            onUserLogout(); 
        }
    };
    
    // FIX: Destructure password fields here for use in JSX
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    return (
        <>
            <div className="stg-account-content">
                <h2 className="stg-section-title">Account Settings</h2>
                
                {/* Error message moved outside the modal logic */}
                {settingsError && <p style={{color: 'var(--stg-error-red)', marginBottom: '1rem', fontWeight: 600, textAlign: 'center'}}>{settingsError}</p>}

                {/* Password & Security Card */}
                <div className="stg-settings-card">
                    <h3>🔐 Password & Security</h3>
                    <p className="stg-card-description">
                        Secure your account by changing your password regularly.
                    </p>
                    <button className="stg-change-password-btn" onClick={openPasswordModal} disabled={isLoading}>
                        Change Password
                    </button>
                </div>

                {/* Notification Preferences Card */}
                <div className="stg-settings-card">
                    <h3>🔔 Notification Preferences</h3>
                    
                    <div className="stg-toggle-switch-container">
                        <span className="stg-toggle-label">Promotional Emails</span>
                        <ToggleSwitch id="promotionalEmails" checked={preferences.promotionalEmails} onChange={handleToggleChange} disabled={isLoading} />
                    </div>
                    <div className="stg-toggle-switch-container">
                        <span className="stg-toggle-label">Order Updates via SMS</span>
                        <ToggleSwitch id="orderUpdatesSMS" checked={preferences.orderUpdatesSMS} onChange={handleToggleChange} disabled={isLoading} />
                    </div>
                    <div className="stg-toggle-switch-container">
                        <span className="stg-toggle-label">New Arrivals Notifications</span>
                        <ToggleSwitch id="newArrivals" checked={preferences.newArrivals} onChange={handleToggleChange} disabled={isLoading} />
                    </div>
                    <div className="stg-toggle-switch-container">
                        <span className="stg-toggle-label">Price Drop Alerts</span>
                        <ToggleSwitch id="priceDropAlerts" checked={preferences.priceDropAlerts} onChange={handleToggleChange} disabled={isLoading} />
                    </div>
                </div>

                {/* Data & Privacy Card */}
                <div className="stg-settings-card">
                    <h3>🔒 Data & Privacy</h3>
                    <div className="stg-toggle-switch-container">
                        <span className="stg-toggle-label">Enable Personalized Recommendations</span>
                        <ToggleSwitch id="personalizedRecommendations" checked={preferences.personalizedRecommendations} onChange={handleToggleChange} disabled={isLoading} />
                    </div>
                    <div className="stg-toggle-switch-container">
                        <span className="stg-toggle-label">Allow Marketing Cookies (3rd Party)</span>
                        <ToggleSwitch id="marketingCookies" checked={preferences.marketingCookies} onChange={handleToggleChange} disabled={isLoading} />
                    </div>
                    <div className="stg-toggle-switch-container">
                        <span className="stg-toggle-label">Automatically Clear Old Sessions (Security)</span>
                        <ToggleSwitch id="clearOldSessions" checked={preferences.clearOldSessions} onChange={handleToggleChange} disabled={isLoading} />
                    </div>
                </div>

                {/* Session Management Card */}
                <div className="stg-settings-card">
                    <h3>🚪 Session Management</h3>
                    <p className="stg-card-description">
                        Sign out from your account on all devices or revoke access tokens.
                    </p>
                    <button className="stg-change-password-btn" onClick={handleSignOutAll} disabled={isLoading}>
                        Sign Out All Devices
                    </button>
                </div>
            </div>

            {/* Password Change Modal */}
            {isPasswordModalOpen && (
                <div className="stg-modal">
                    <div className="stg-modal-content">
                        {/* Modal-specific error display */}
                        {settingsError && <p style={{color: 'var(--stg-error-red)', marginBottom: '1rem', fontWeight: 600, textAlign: 'center'}}>{settingsError}</p>}
                        
                        <svg
                            className="stg-modal-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                        <h2>Change Password</h2>
                        <form onSubmit={handlePasswordSubmit}>
                            
                            {/* 1. Current Password */}
                            <div className="stg-form-group stg-password-field-group">
                                <label htmlFor="current-pass">Current Password</label>
                                <input
                                    type={showCurrentPass ? 'text' : 'password'}
                                    id="current-pass"
                                    value={currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    required
                                />
                                <span className="stg-password-toggle-icon" onClick={() => togglePassVisibility('current')}>
                                    {showCurrentPass ? '👁️' : '🔒'}
                                </span>
                            </div>

                            {/* 2. New Password */}
                            <div className="stg-form-group stg-password-field-group">
                                <label htmlFor="new-pass">New Password</label>
                                <input
                                    type={showNewPass ? 'text' : 'password'}
                                    id="new-pass"
                                    value={newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    required
                                />
                                <span className="stg-password-toggle-icon" onClick={() => togglePassVisibility('new')}>
                                    {showNewPass ? '👁️' : '🔒'}
                                </span>
                            </div>
                            
                            {/* 3. Confirm New Password */}
                            <div className="stg-form-group stg-password-field-group">
                                <label htmlFor="confirm-pass">Confirm New Password</label>
                                <input
                                    type={showConfirmPass ? 'text' : 'password'}
                                    id="confirm-pass"
                                    value={confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    required
                                />
                                <span className="stg-password-toggle-icon" onClick={() => togglePassVisibility('confirm')}>
                                    {showConfirmPass ? '👁️' : '🔒'}
                                </span>
                            </div>

                            <div className="stg-modal-buttons">
                                <button
                                    type="button"
                                    className="stg-btn stg-btn-secondary"
                                    onClick={closePasswordModal}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="stg-btn" disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsManager;