// frontend/src/components/admin/UserDashboard.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getAdminReports } from '../../api/userApi'; 
import '../../styles/admin/UsersDashboard.css'; 

// --- REQUIRED API FUNCTIONS (Self-Contained for Debugging) ---

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

/**
 * @description Fetches all user profiles for the admin dashboard. 
 */
const getAllUsersAdmin = async () => {
    const token = getToken();
    try {
        const response = await axios.get(`${API_BASE_URL}/user/users`, { 
            headers: { Authorization: `Bearer ${token}` }
        });
        
        return response.data.users || [];
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to fetch user list. API Error: ${errorMessage}`);
    }
};

/**
 * @description Updates a user's status (block/unblock) via an admin endpoint. 
 */
const updateUserStatusAdmin = async (userId, newStatus, durationDays = null) => {
    const token = getToken();
    try {
        const payload = { 
            status: newStatus,
            durationDays: durationDays
        };
        const response = await axios.put(`${API_BASE_URL}/user/users/${userId}/status`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.user;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to update status: ${errorMessage}`);
    }
};

// --- SVG ICON LIBRARY (Embedded) ---
const UsersIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const SearchIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const EyeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s5-7 10-7 10 7 10 7-5 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const BanIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    </svg>
);
const UnlockIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const RefreshCwIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.5 15a9 9 0 0 1 14.5-9.75 9 9 0 0 1 0 15.5"></path></svg>
);
const XIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const MailIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
);
const PhoneIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6.7-6.7A19.79 19.79 0 0 1 3 4.18 2 2 0 0 1 5.08 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);


// Initial state placeholders
const INITIAL_STATS = { totalUsers: '0', activeUsers: '0', blockedUsers: '0' };
const INITIAL_USERS_STATE = []; 

const UsersDashboard = () => {
    // Data States
    const [users, setUsers] = useState(INITIAL_USERS_STATE);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeUser, setActiveUser] = useState(null);
    const [stats, setStats] = useState(INITIAL_STATS);
    
    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showTempBlockModal, setShowTempBlockModal] = useState(false);
    const [blockDuration, setBlockDuration] = useState(7);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [error, setError] = useState(null);

    // 1. API CALL: Fetch Data
    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const usersData = await getAllUsersAdmin();
            setUsers(usersData);

            // Calculate live stats from fetched data
            const totalUsers = usersData.length;
            const activeUsers = usersData.filter(u => u.status === 'Active').length;
            const blockedUsers = usersData.filter(u => u.status?.includes('Blocked')).length;
            
            setStats({ 
                totalUsers: totalUsers.toString(), 
                activeUsers: activeUsers.toString(), 
                blockedUsers: blockedUsers.toString() 
            });
            
        } catch (err) {
            // Display specific error message from the API call
            const msg = err.message || 'Failed to load user data from API.';
            setError(msg);
            setUsers([]);
            setStats(INITIAL_STATS);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. Core Status Update Logic
    const handleStatusUpdate = async (userId, newStatus, durationDays = null, confirmationMessage) => {
        if (!window.confirm(confirmationMessage)) return;

        setIsLoading(true);
        try {
            const updatedUser = await updateUserStatusAdmin(userId, newStatus, durationDays);
            
            // Update the local users array with the returned updated user object
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, ...updatedUser } : u
            ));
            
            setNotificationMessage(`User ${updatedUser.name || updatedUser.first_name || 'Status Updated'} status updated to: ${updatedUser.status}.`);
            setShowUserModal(false);
            setShowTempBlockModal(false);
            
            // Re-run fetchUserData to update statistics immediately
            await fetchUserData(); 

        } catch (err) {
            const msg = err.message || 'Failed to update user status.';
            setError(msg);
            setNotificationMessage(`Error: ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Handlers for UI actions
    const handleViewDetails = (user) => {
        setActiveUser(user);
        setShowUserModal(true);
    };

    const handlePermanentBlock = () => {
        if (!activeUser) return;
        const msg = `Are you sure you want to PERMANENTLY block ${activeUser.name || activeUser.first_name}?`;
        handleStatusUpdate(activeUser.id, 'Permanently Blocked', null, msg);
    };

    const handleTempBlock = () => {
        if (!activeUser) return;
        setShowUserModal(false); 
        setShowTempBlockModal(true);
    };

    const handleConfirmTempBlock = () => {
        if (!activeUser || blockDuration < 1) return;
        const msg = `Confirm blocking ${activeUser.name || activeUser.first_name} for ${blockDuration} days?`;
        handleStatusUpdate(activeUser.id, 'Temporarily Blocked', blockDuration, msg);
        setBlockDuration(7); // Reset duration
    };

    const handleUnblock = () => {
        if (!activeUser) return;
        const msg = `Are you sure you want to UNBLOCK ${activeUser.name || activeUser.first_name} and set status to Active?`;
        handleStatusUpdate(activeUser.id, 'Active', null, msg);
    };

    // 4. Effects
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        if (notificationMessage) {
            const timer = setTimeout(() => setNotificationMessage(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [notificationMessage]);

    // 5. Filtering/Search Logic
    const filteredUsers = (users || []).filter(user => 
        (user.name || user.first_name)?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 6. Helper: Status Styling
    const getStatusClass = (status) => {
        if (status?.includes('Blocked')) return 'blocked';
        if (status === 'Active') return 'active';
        if (status === 'Inactive') return 'inactive';
        return 'inactive';
    };

    // 7. Render Sections
    const renderUserTable = () => {
        if (isLoading) {
            return <tr><td colSpan="7" className="adu-loading-message">Loading user data...</td></tr>;
        }

        if (error) {
             return <tr><td colSpan="7" className="adu-error-message">Error: {error}</td></tr>;
        }

        if (filteredUsers.length === 0) {
            return <tr><td colSpan="7" className="adu-empty-message">No users found matching your search.</td></tr>;
        }

        return filteredUsers.map(user => (
            // CRITICAL: Use uid/id for key
            <tr key={user.id}> 
                <td>{user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}</td>
                <td><span style={{ display: 'flex', alignItems: 'center' }}><MailIcon style={{ marginRight: '5px', width: '14px', height: '14px' }} /> {user.email || 'N/A'}</span></td>
                <td><span style={{ display: 'flex', alignItems: 'center' }}><PhoneIcon style={{ marginRight: '5px', width: '14px', height: '14px' }} /> {user.phone_number || 'N/A'}</span></td>
                <td><span className={`adu-status-badge ${user.role?.toLowerCase()}`}>{user.role || 'Customer'}</span></td>
                <td>{user.lastLogin || 'N/A'}</td>
                <td><span className={`adu-status-badge ${getStatusClass(user.status)}`}>{user.status || 'Active'}</span></td>
                <td>
                    <div className="adu-actions">
                        <button onClick={() => handleViewDetails(user)} className="adu-action-btn" title="View Details" disabled={isLoading}><EyeIcon /></button>
                        {(user.status === 'Active' || user.status === 'Inactive') ? (
                            <button onClick={() => { setActiveUser(user); handleTempBlock(); }} className="adu-action-btn ado-block" title="Block User" disabled={isLoading}><BanIcon /></button>
                        ) : (
                             <button onClick={() => { setActiveUser(user); handleUnblock(); }} className="adu-action-btn ado-unblock" title="Unblock User" disabled={isLoading}><UnlockIcon /></button>
                        )}
                    </div>
                </td>
            </tr>
        ));
    };

    return (
        <div className="adu-users-dashboard">
            {/* Header / Controls */}
            <div className="adu-header">
                <h1 className="adu-main-title">User Management</h1>
                <div className="adu-controls">
                    <div className="adu-search-container">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="adu-search-input"
                            disabled={isLoading}
                        />
                    </div>
                    <button onClick={fetchUserData} className="adu-btn adu-btn-refresh" title="Refresh User Data" disabled={isLoading}>
                        <RefreshCwIcon />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="adu-user-stats">
                <div className="adu-stat-card adu-total">
                    <UsersIcon className="adu-stat-icon"/>
                    <span className="adu-stat-label">Total Users</span>
                    <span className="adu-stat-value">{stats.totalUsers}</span>
                </div>
                <div className="adu-stat-card adu-active">
                    <UsersIcon className="adu-stat-icon"/>
                    <span className="adu-stat-label">Active Users</span>
                    <span className="adu-stat-value">{stats.activeUsers}</span>
                </div>
                <div className="adu-stat-card adu-blocked">
                    <UsersIcon className="adu-stat-icon"/>
                    <span className="adu-stat-label">Blocked Users</span>
                    <span className="adu-stat-value">{stats.blockedUsers}</span>
                </div>
            </div>

            {/* Users Table */}
            <div className="adu-user-table-container">
                <table className="adu-user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Last Login</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderUserTable()}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {showUserModal && activeUser && (
                <div className="adu-modal-overlay">
                    <div className="adu-modal-content">
                        <div className="adu-modal-header">
                            <h2>User Details: {activeUser.name || activeUser.first_name}</h2>
                            <button className="adu-close-btn" onClick={() => setShowUserModal(false)} aria-label="Close modal">
                                <XIcon />
                            </button>
                        </div>
                        <div className="adu-modal-body">
                            <p><strong>ID:</strong> {activeUser.id}</p>
                            <p><strong>Email:</strong> {activeUser.email}</p>
                            <p><strong>Phone:</strong> {activeUser.phone_number || 'N/A'}</p>
                            <p><strong>Role:</strong> {activeUser.role}</p>
                            <p><strong>Joined:</strong> {activeUser.joinedDate || 'N/A'}</p>
                            <p><strong>Status:</strong> <span className={`adu-status-badge ${getStatusClass(activeUser.status)}`}>{activeUser.status}</span></p>
                        </div>
                        <div className="adu-modal-footer">
                            <button className="adu-action-btn adu-block-temp" onClick={handleTempBlock} disabled={isLoading}>
                                <BanIcon /> Temp Block
                            </button>
                            <button className="adu-action-btn adu-block-perm" onClick={handlePermanentBlock} disabled={isLoading}>
                                <BanIcon /> Perm Block
                            </button>
                             {activeUser.status?.includes('Blocked') && (
                                <button className="adu-action-btn adu-unblock" onClick={handleUnblock} disabled={isLoading}>
                                    <UnlockIcon /> Unblock
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Temporary Block Modal */}
            {showTempBlockModal && activeUser && (
                <div className="adu-modal-overlay">
                    <div className="adu-modal-content adu-small-modal">
                        <div className="adu-modal-header">
                            <h2>Block {activeUser.name || activeUser.first_name}</h2>
                            <button className="adu-close-btn" onClick={() => setShowTempBlockModal(false)} aria-label="Close modal">
                                <XIcon />
                            </button>
                        </div>
                        <div className="adu-modal-body">
                            <label htmlFor="block-duration" className="adu-modal-label">Block Duration (days):</label>
                            <input
                                type="number"
                                id="block-duration"
                                min="1"
                                value={blockDuration}
                                onChange={(e) => setBlockDuration(parseInt(e.target.value) || 1)}
                                placeholder="Enter number of days"
                                className="adu-input-field"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="adu-modal-footer">
                            <button className="adu-cancel-btn" onClick={() => setShowTempBlockModal(false)} disabled={isLoading}>
                                Cancel
                            </button>
                            <button className="adu-block-btn" onClick={handleConfirmTempBlock} disabled={isLoading}>
                                Confirm Block
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Notification Banner */}
            {notificationMessage && (
                <div className="adu-notification-banner">
                    {notificationMessage}
                </div>
            )}
            
            {/* Global Error Message Display */}
            {error && (
                <div className="adu-notification-banner" style={{ backgroundColor: 'var(--danger-color)', color: 'white' }}>
                    Error: {error}
                </div>
            )}
        </div>
    );
};

export default UsersDashboard;