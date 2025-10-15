// frontend/src/pages/OrdersPage.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// API Import (Replaces the large mock data)
import { getOrdersByUserId } from '../api/ordersApi'; 
// Components
import IssueReportForm from '../components/Orders/IssueReportForm'; // Assumed new component for reporting
import '../styles/OrdersPage.css';

// --- Track Order Modal Component (CRITICAL ANIMATION LOGIC) ---
// This uses the animation logic previously established in the React file.
const TrackOrderModal = ({ order, isOpen, onClose, openIssueReport }) => {
    
    const truckRef = useRef(null);
    const timelineRef = useRef(null);
    const dotsRef = useRef(null);

    // Mapped from backend status (must match the classes in OrdersPage.css)
    const statusMapping = {
        'Processing': { position: 'placed', index: 0 }, // Mapping 'Processing' to 'placed'
        'Packed': { position: 'packed', index: 1 },
        'Shipped': { position: 'shipped', index: 2 },
        'Out for Delivery': { position: 'out-for-delivery', index: 3 },
        'Delivered': { position: 'delivered', index: 4 },
        'Cancelled': { position: 'placed', index: 0 }, 
    };

    // --- Animation and Timeline Control Effect ---
    useEffect(() => {
        if (!isOpen || !order || !truckRef.current) return;

        const truckContainer = truckRef.current;
        const currentStatus = order.status;
        const timeline = order.timeline || [];

        // Helper function to update the timeline display
        const updateTimeline = (status) => {
            if (!timelineRef.current) return;
            timelineRef.current.innerHTML = '';
            
            // Map the API status string to the animation status key
            const statusKey = status.toLowerCase().replace(' ', '-');
            const mapping = statusMapping[status] || statusMapping['Processing']; // Fallback
            
            let foundCurrent = false;

            timeline.forEach((event, index) => {
                const eventKey = event.status.toLowerCase().replace(' ', '-');
                const eventElement = document.createElement('div');
                eventElement.className = 'timeline-event';
                
                // Determine completion status
                if (eventKey === statusKey && !foundCurrent) {
                    eventElement.classList.add('active');
                    foundCurrent = true;
                } else if (!foundCurrent) {
                    eventElement.classList.add('completed');
                } else {
                    eventElement.classList.add('pending');
                }
                
                // Timeline content HTML structure
                eventElement.innerHTML = `
                    <div class="event-details-wrapper">
                        ${event.date ? `<span class="event-date">${event.date}</span>` : ''}
                        <p class="event-details">${event.details}</p>
                    </div>
                `;
                
                // Apply visual animation (CSS keyframes must exist)
                eventElement.style.animationDelay = `${index * 0.1}s`;
                eventElement.style.animation = 'timelineSlideIn 0.5s ease-out forwards';
                
                timelineRef.current.appendChild(eventElement);
            });
            
            // Update progress dots (using index from the determined mapping)
            const dots = dotsRef.current.querySelectorAll('.progress-dot');
            dots.forEach((dot, index) => {
                dot.className = 'progress-dot';
                if (index < mapping.index) {
                    dot.classList.add('completed');
                } else if (index === mapping.index) {
                    dot.classList.add('active');
                }
            });
        };

        // --- Truck Animation ---
        const targetMapping = statusMapping[currentStatus] || statusMapping['Processing'];

        // 1. Reset truck position immediately
        truckContainer.className = 'truck-container';
        truckContainer.style.left = '-120px'; // Initial hidden position
        truckContainer.classList.add('moving'); 

        // 2. Animate to target position
        setTimeout(() => {
            truckContainer.classList.add(targetMapping.position);
            truckContainer.classList.remove('moving'); 
            
            updateTimeline(currentStatus);

            // 3. Start stationary effect
            if (currentStatus !== 'Delivered') {
                 truckContainer.classList.add('stationary-effect'); 
            }
        }, 100); 

        return () => {
            // Cleanup: ensure the body scroll lock is removed on unmount/close
            truckContainer.className = 'truck-container';
        };
    }, [isOpen, order]); 

    if (!isOpen || !order) return null;
    
    // Check if the order is delivered (to show/hide Return button)
    const isDelivered = order.status === 'Delivered';

    return (
        <div id="trackOrderModal" className="modal" style={{ display: 'flex' }}>
            <div className="modal-content">
                <span className="close-btn" onClick={onClose}>&times;</span>
                <h2 id="modal-title">Track Order #{order.id}</h2>
                <h4 id="modalSubtitle" style={{ color: 'var(--secondary-text)', marginBottom: '1.5rem' }}>Placed on {order.date}</h4>

                {/* Tracking Animation and Progress Dots */}
                <div className="track-animation-container">
                    {/* ... (Existing SVG and CSS-driven animation elements) ... */}
                    <div className="truck-container" ref={truckRef}>
                        {/* Simplified SVG Truck for JSX (Placeholder content, relies on CSS) */}
                         <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" className="truck-svg">
                            <path d="M10 35 L10 15 L25 15 L35 25 L100 25 L100 35 Z" fill="var(--truck-color)" stroke="#f8f8f8" strokeWidth="1.5"/>
                            <rect x="35" y="25" width="65" height="15" fill="#2c3e50" stroke="#f8f8f8" strokeWidth="1.5"/>
                            <circle cx="25" cy="45" r="10" fill="var(--tire-color)" stroke="#f8f8f8" strokeWidth="2" className="tire"/>
                            <circle cx="75" cy="45" r="10" fill="var(--tire-color)" stroke="#f8f8f8" strokeWidth="2" className="tire"/>
                        </svg>
                        <div className="exhaust-smoke"></div>
                         <div className="dust-trail"></div>
                    </div>
                    
                    <div className="progress-dots" ref={dotsRef}>
                        <div className="progress-dot" data-status="placed"></div>
                        <div className="progress-dot" data-status="packed"></div>
                        <div className="progress-dot" data-status="shipped"></div>
                        <div className="progress-dot" data-status="out-for-delivery"></div>
                        <div className="progress-dot" data-status="delivered"></div>
                    </div>

                    <div className="road"></div>
                </div>

                {/* Tracking Timeline */}
                <div className="tracking-timeline" id="trackingTimeline" ref={timelineRef}>
                    {/* Content populated by useEffect */}
                </div>
                
                {/* Modal Action Buttons */}
                <div className="modal-actions" style={{ marginTop: '2rem' }}>
                    <button className="btn btn-primary" onClick={() => alert('Invoice Download Simulated!')}>
                        Download Invoice
                    </button>
                    {isDelivered && (
                        <button className="btn btn-secondary" onClick={() => alert('Return Request Simulated!')}>
                            Request Return
                        </button>
                    )}
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => openIssueReport(order.id)}
                        style={{ background: 'var(--status-cancelled)'}}
                    >
                        Report Issue
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Orders Page Component ---
const OrdersPage = ({ user }) => {
    
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reportOrderId, setReportOrderId] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // --- CORE DATA FETCHING ---
    const fetchOrders = useCallback(async () => {
        if (!user || !token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // API Call to backend
            const orderList = await getOrdersByUserId(token);
            setOrders(orderList.reverse()); // Reverse to show newest first
        } catch (error) {
            console.error("Error fetching user orders:", error);
            // Handle error, maybe show a notification
        } finally {
            setIsLoading(false);
        }
    }, [user, token]);

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            navigate('/auth', { state: { from: '/orders' } });
            return;
        }
        fetchOrders();
    }, [user, fetchOrders, navigate]);
    
    // --- Handlers ---
    const handleTrackOrder = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
        document.body.style.overflow = 'auto';
    };
    
    const handleOpenIssueReport = (orderId) => {
        setReportOrderId(orderId);
        setIsModalOpen(false); // Close the tracking modal
        setIsReportModalOpen(true);
    };
    
    const handleCloseReportModal = () => {
        setIsReportModalOpen(false);
        setReportOrderId(null);
        document.body.style.overflow = 'auto';
    };


    if (isLoading) {
        return <div className="loading-state-overlay">Loading order history...</div>;
    }

    // Since authentication is handled by useEffect redirect, we assume user is present here.
    if (orders.length === 0) {
    return (
        <div className="orders-container">
            <h1 className="page-title">My Orders</h1>
            <div className="empty-orders">
                <div className="empty-orders-icon">📦</div>
                <h2>No Orders Yet!</h2>
                <p>It looks like your order history is empty. Time to find something new!</p>
                <button onClick={() => navigate('/collections')} className="btn-browse">Start Shopping</button>
            </div>
        </div>
    );
}

    // --- Main Render ---
    return (
        <>
            <div className="orders-container">
                <h1 className="page-title">My Orders</h1>

                <div id="orders-content">
                    <div className="order-list">
                        {orders.map((order) => (
                            <div className="order-card" key={order.id} data-order-id={order.id}>
                                <div className="order-header">
                                    <div className="order-info">
                                        <h3>Order #<span>{order.id}</span></h3>
                                        <p>Placed on: {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <span className={`order-status status-${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span>
                                </div>
                                <div className="order-footer">
                                  <div className="order-total">₹{order.total_amount?.toLocaleString('en-IN')}</div>
                                  <div className="order-actions">
                                    <button className="btn track-order-btn" onClick={() => handleTrackOrder(order)}>
                                      Track Order
                                    </button>
                                  </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Tracking Modal Integration */}
            <TrackOrderModal 
                order={selectedOrder} 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                openIssueReport={handleOpenIssueReport}
            />
            
            {/* Issue Report Form Modal */}
            {isReportModalOpen && (
                <IssueReportForm 
                    isOpen={isReportModalOpen} 
                    onClose={handleCloseReportModal} 
                    orderId={reportOrderId} 
                    user={user}
                />
            )}
        </>
    );
};

export default OrdersPage;