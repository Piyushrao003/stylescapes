// frontend/src/components/admin/OrdersAdmin.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../../styles/admin/OrdersAdmin.css'; 

// --- SVG ICON LIBRARY (No external library dependency) ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const PrinterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
);
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s5-7 10-7 10 7 10 7-5 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);
const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);
const RefreshCwIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.5 15a9 9 0 0 1 14.5-9.75 9 9 0 0 1 0 15.5"></path></svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


// Constants for available statuses
const ORDER_STATUSES = ['All', 'Received', 'Shipped', 'Completed', 'Incomplete', 'Cancelled'];

const OrdersAdmin = () => {
    // Orders State: Initially empty, filled by API call
    const [allOrders, setAllOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editOrder, setEditOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [notification, setNotification] = useState({ message: '', isError: false });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. API CALL: Fetch Orders - NO MOCK DATA
    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Replace this placeholder with your secure, authenticated API call to fetch all orders
            // const response = await axios.get('/api/admin/orders');
            // setAllOrders(response.data); 
            // Mock empty data for now
            setAllOrders([]);

        } catch (err) {
            setError('Failed to fetch orders from API.');
            setAllOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Filtering Logic
    const applyFilters = useCallback(() => {
        let result = allOrders;

        // Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(order => order.status === statusFilter);
        }

        // Search Filter
        if (searchTerm.trim() !== '') {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(order =>
                order.orderId.toLowerCase().includes(lowerCaseSearch) ||
                order.customerName.toLowerCase().includes(lowerCaseSearch) ||
                order.email.toLowerCase().includes(lowerCaseSearch)
            );
        }

        setFilteredOrders(result);
    }, [allOrders, statusFilter, searchTerm]);

    // 3. Handlers
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };

    const handleEditStatus = (order) => {
        setEditOrder(order);
        setShowEditModal(true);
    };

    const handleSaveStatus = async () => {
        if (!editOrder) return;

        // In a real application, you would call the update API here:
        // await axios.post(`/api/admin/orders/${editOrder.id}/status`, { status: editOrder.status });
        
        // Update local state (Optimistic Update)
        setAllOrders(prev => prev.map(order => 
            order.orderId === editOrder.orderId ? { ...order, status: editOrder.status } : order
        ));

        setNotification({ message: `Status for Order #${editOrder.orderId} updated to ${editOrder.status}.`, isError: false });
        setShowEditModal(false);
        setEditOrder(null);
    };

    const handleExport = () => {
        setNotification({ message: 'Exporting order data (PDF/CSV)...', isError: false });
        // Logic for data transformation and export
    };

    // 4. Effects
    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allOrders, applyFilters]);
    
    useEffect(() => {
        // Clear notification after 4 seconds
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: '', isError: false }), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification.message]);

    // --- Helper for Status Styling ---
    const getStatusClass = (status) => {
        switch (status) {
            case 'Shipped': return 'shipped';
            case 'Completed': return 'completed';
            case 'Cancelled': return 'cancelled';
            case 'Incomplete': return 'incomplete';
            case 'Received': return 'received';
            default: return '';
        }
    };

    // --- Render Sections ---
    const renderOrderTable = () => {
        if (isLoading) {
            return <tr><td colSpan="8" className="ado-loading-message">Loading orders...</td></tr>;
        }

        if (error) {
            return <tr><td colSpan="8" className="ado-error-message">{error}</td></tr>;
        }

        if (filteredOrders.length === 0) {
            return <tr><td colSpan="8" className="ado-empty-message">No orders found matching the criteria.</td></tr>;
        }

        return filteredOrders.map(order => (
            <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.customerName}</td>
                <td>{order.date}</td>
                <td>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                <td>
                    <span className={`ado-status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                    </span>
                </td>
                <td>{order.items.length}</td>
                <td className="ado-actions">
                    <button onClick={() => handleViewDetails(order)} className="ado-action-btn ado-view" title="View Details"><EyeIcon /></button>
                    <button onClick={() => handleEditStatus(order)} className="ado-action-btn ado-edit" title="Edit Status"><EditIcon /></button>
                </td>
            </tr>
        ));
    };

    return (
        <div className="ado-orders-admin-container">
            <h1 className="ado-main-title">Order Management</h1>

            {/* Controls Row: Search, Filter, Export */}
            <div className="ado-controls">
                
                <div className="ado-search-container">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Search by ID, Name, or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="ado-search-input"
                    />
                </div>

                <div className="ado-filter-tabs">
                    {ORDER_STATUSES.map(status => (
                        <button
                            key={status}
                            className={`ado-filter-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="ado-export-actions">
                    <button onClick={fetchOrders} className="ado-btn ado-btn-refresh" title="Refresh Data">
                        <RefreshCwIcon />
                    </button>
                    <button onClick={handleExport} className="ado-btn ado-btn-export">
                        <DownloadIcon /> Export
                    </button>
                    <button onClick={() => window.print()} className="ado-btn ado-btn-print">
                        <PrinterIcon /> Print
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="ado-table-container">
                <table className="ado-orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Items</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderOrderTable()}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="ado-modal-overlay">
                    <div className="ado-modal-content">
                        <div className="ado-modal-header">
                            <h2>Order Details: #{selectedOrder.orderId}</h2>
                            <button className="ado-close-btn" onClick={() => setShowDetailsModal(false)}><XIcon /></button>
                        </div>
                        <div className="ado-modal-body">
                            <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                            <p><strong>Email:</strong> {selectedOrder.email}</p>
                            <p><strong>Total:</strong> ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</p>
                            <p><strong>Status:</strong> <span className={`ado-status-badge ${getStatusClass(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                            <h3 className="ado-section-subheading">Items</h3>
                            <ul className="ado-item-list">
                                {selectedOrder.items.map((item, index) => (
                                    <li key={index}>{item.name} x {item.qty} (₹{item.price})</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Edit Modal */}
            {showEditModal && editOrder && (
                <div className="ado-modal-overlay">
                    <div className="ado-modal-content ado-edit-modal">
                        <div className="ado-modal-header">
                            <h2>Update Status for #{editOrder.orderId}</h2>
                            <button className="ado-close-btn" onClick={() => setShowEditModal(false)}><XIcon /></button>
                        </div>
                        <div className="ado-modal-body">
                            <p style={{ marginBottom: '15px' }}>Current Status: <span className={`ado-status-badge ${getStatusClass(editOrder.status)}`}>{editOrder.status}</span></p>
                            
                            <div className="ado-status-control">
                                <label htmlFor="status-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                                    New Status:
                                </label>
                                <select
                                    id="status-select"
                                    className="ado-status-select"
                                    value={editOrder.status}
                                    onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
                                >
                                    {ORDER_STATUSES.filter(s => s !== 'All').map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <button className="ado-save-btn" onClick={handleSaveStatus}>
                                <SaveIcon /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.message && (
                <div className={`ado-notification ${notification.isError ? 'error' : 'success'}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default OrdersAdmin;