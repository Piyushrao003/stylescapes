import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../../styles/admin/ProfileAdmin.css'; 

// --- SVG ICON LIBRARY (Embedded) ---
const SunIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
);
const MoonIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>
);
const UserShieldIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 7h.01"/><path d="M10 11a2 2 0 1 0 4 0 2 2 0 1 0-4 0z"/></svg>
);
const BellIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.375 21a2 2 0 1 0 3.25 0"/></svg>
);
const FileTextIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
);
const DatabaseIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12h18"/></svg>
);
const NetworkIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-3v-3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/><line x1="12" y1="12" x2="12" y2="18"/></svg>
);
const ClockIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const ArrowUpIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
);
const ArrowDownIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
);
const CheckIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const ExclamationCircleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);
const ServerIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
);
const ShieldIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const MessageSquareIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const GaugeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14v4"/><path d="M15.5 17.5 18 20"/><path d="M8.5 17.5 6 20"/><path d="M17 19.25a10 10 0 1 0-10 0"/></svg>
);
const PackageIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="m21 15-9-5.15-9 5.15"/><path d="m3 9 9 5.15 9-5.15"/><path d="M12 22.78V14"/></svg>
);
const ShoppingCartIconMeta = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 12.87a2 2 0 0 0 2 1.63h9.72a2 2 0 0 0 2-1.63L23 6H6"/></svg>
);
const PercentIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
);


// --- MOCK/INITIAL DATA (Structure for API Response) ---
const INITIAL_ADMIN_DATA_STRUCTURE = {
    name: "Loading...",
    role: "...",
    email: "...",
    phone: "...",
    location: "...",
    lastLogin: "...",
    initials: "AD"
};

const INITIAL_STATS = [
    { id: 1, title: "Total Alerts", value: '47', change: 12, positive: true, icon: BellIcon, startColor: '#6366f1', endColor: '#8b5cf6' },
    { id: 2, title: "Active Complaints", value: '12', change: 5, positive: false, icon: ExclamationCircleIcon, startColor: '#f87171', endColor: '#ef4444' },
    { id: 3, title: "System Issues", value: '8', change: 3, positive: true, icon: ServerIcon, startColor: '#fbbf24', endColor: '#f59e0b' },
    { id: 4, title: "Resolved Today", value: '23', change: 18, positive: true, icon: PackageIcon, startColor: '#34d399', endColor: '#10b981' },
];

const INITIAL_ALERTS = [
    { id: 101, type: 'system', title: 'Database Connection Pool Warning', subtitle: '#SYS-3392', priority: 'medium', description: 'Primary database connection pool reaching 85% capacity.', meta: [{ icon: DatabaseIcon, text: 'PostgreSQL Primary' }, { icon: GaugeIcon, text: '85% capacity' }], time: '1 hour ago' },
    { id: 106, type: 'latency', title: 'Slow Page Load Times - Checkout', subtitle: '#LAT-7622', priority: 'critical', description: 'Checkout page experiencing severe performance degradation. High cart abandonment rate detected.', meta: [{ icon: ShoppingCartIconMeta, text: 'Checkout Service' }, { icon: PercentIcon, text: '73% abandonment' }], time: '45 minutes ago' },
]; // Using a subset for demo

const ALERT_TYPES = ['all', 'complaint', 'latency', 'system', 'security'];


const ProfileAdmin = () => {
    const [adminData, setAdminData] = useState(INITIAL_ADMIN_DATA_STRUCTURE);
    const [stats, setStats] = useState(INITIAL_STATS);
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);
    const [activeFilter, setActiveFilter] = useState('all');
    const [theme, setTheme] = useState('dark-theme'); 

    // 1. Fetch Actual Admin Profile Data and Stats
    useEffect(() => {
        const fetchAdminData = async () => {
            // MOCK API call success
            const profile = { name: 'Arjun Sharma', role: 'Super Admin', email: 'admin@stylescapes.com', phone: '+91 98765 43210', location: 'Mumbai, India', lastLogin: Date.now() };
            
            setAdminData({
                name: profile.name,
                role: profile.role,
                email: profile.email,
                phone: profile.phone,
                location: profile.location,
                lastLogin: new Date(profile.lastLogin).toLocaleString(),
                initials: profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'AD'
            });
            // Stats and Alerts are left as INITIAL_STATS/ALERTS for this simplified demo
        };

        fetchAdminData();
    }, []);
    
    // Theme logic
    const toggleTheme = () => {
        const newTheme = theme === 'dark-theme' ? 'light-theme' : 'dark-theme';
        setTheme(newTheme);
        document.body.className = newTheme;
    };

    const handleResolve = (id) => {
        if (window.confirm("Are you sure you want to resolve this alert?")) {
            setAlerts(prev => prev.filter(a => a.id !== id));
        }
    };

    const filteredAlerts = alerts.filter(alert => activeFilter === 'all' || alert.type === activeFilter);

    // --- Render Helpers ---

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'critical': return 'ada-critical';
            case 'high': return 'ada-high';
            case 'medium': return 'ada-medium';
            case 'low': return 'ada-low';
            default: return 'ada-low';
        }
    };
    
    const getTypeIcon = (type) => {
        switch (type) {
            case 'system': return ServerIcon;
            case 'security': return ShieldIcon;
            case 'complaint': return MessageSquareIcon;
            case 'latency': return ClockIcon;
            default: return BellIcon;
        }
    };

    const renderAlertCards = () => {
        if (filteredAlerts.length === 0) {
            return (
                <div className="ada-empty-alerts">
                    <BellIcon size={48} />
                    <p>No active alerts found for the selected filter.</p>
                </div>
            );
        }

        return filteredAlerts.map(alert => {
            const AlertIcon = getTypeIcon(alert.type);
            const priorityClass = getPriorityBadgeClass(alert.priority);

            return (
                <div key={alert.id} className={`ada-alert-card ada-${alert.type}`} data-type={alert.type}>
                    <div className="ada-alert-header">
                        <div className="ada-alert-title-section">
                            <div className="ada-alert-icon">
                                <AlertIcon />
                            </div>
                            <div className="ada-alert-title-text">
                                <h3 className="ada-alert-title">{alert.title}</h3>
                                <p className="ada-alert-subtitle">{alert.subtitle}</p>
                            </div>
                        </div>
                        <span className={`ada-alert-badge ${priorityClass}`}>{alert.priority}</span>
                    </div>
                    
                    <div className="ada-alert-body">
                        <p className="ada-alert-description">{alert.description}</p>
                        <div className="ada-alert-meta">
                            {alert.meta.map((item, i) => {
                                const MetaIcon = item.icon;
                                return (
                                    <span key={i} className="ada-meta-item">
                                        <MetaIcon style={{ width: '14px', height: '14px', minWidth: '14px' }} /> {item.text}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="ada-alert-footer">
                        <span className="ada-alert-time">
                            <ClockIcon style={{ width: '12px', height: '12px', marginRight: '6px' }} /> {alert.time}
                        </span>
                        <div className="ada-alert-actions">
                            <button className="ada-action-btn ada-primary">
                                <FileTextIcon style={{ width: '14px', height: '14px' }} /> Details
                            </button>
                            <button className="ada-action-btn ada-secondary" onClick={() => handleResolve(alert.id)}>
                                <CheckIcon style={{ width: '14px', height: '14px' }} /> Resolve
                            </button>
                        </div>
                    </div>
                </div>
            );
        });
    };

    // --- Main Render ---
    return (
        <div className="ada-container">
            {/* Admin Profile Section (Replaces the main header) */}
            <div className="ada-admin-profile-header">
                <div className="ada-header-title">
                    <div className="ada-icon-box"><UserShieldIcon /></div>
                    <h1>Admin Profile & Alerts</h1>
                </div>
                {/* Theme Toggle remains functional for this component */}
                <button onClick={toggleTheme} className="ada-theme-toggle">
                    {theme === 'dark-theme' ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>

            <div className="ada-admin-profile">
                <div className="ada-profile-content">
                    <div className="ada-profile-avatar">
                        <div className="ada-avatar">{adminData.initials}</div>
                        <div className="ada-online-indicator"></div>
                    </div>
                    <div className="ada-profile-details">
                        <div>
                            <h2 className="ada-profile-name">{adminData.name}</h2>
                            <span className="ada-profile-role">{adminData.role}</span>
                        </div>
                        <div className="ada-profile-info-grid">
                            <div className="ada-info-item">
                                <div className="ada-info-icon"><FileTextIcon /></div>
                                <div className="ada-info-text">
                                    <span className="ada-info-label">Email</span>
                                    <span className="ada-info-value">{adminData.email}</span>
                                </div>
                            </div>
                            <div className="ada-info-item">
                                <div className="ada-info-icon"><DatabaseIcon /></div>
                                <div className="ada-info-text">
                                    <span className="ada-info-label">Phone</span>
                                    <span className="ada-info-value">{adminData.phone}</span>
                                </div>
                            </div>
                            <div className="ada-info-item">
                                <div className="ada-info-icon"><NetworkIcon /></div>
                                <div className="ada-info-text">
                                    <span className="ada-info-label">Location</span>
                                    <span className="ada-info-value">{adminData.location}</span>
                                </div>
                            </div>
                            <div className="ada-info-item">
                                <div className="ada-info-icon"><ClockIcon /></div>
                                <div className="ada-info-text">
                                    <span className="ada-info-label">Last Login</span>
                                    <span className="ada-info-value">{adminData.lastLogin}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Statistics */}
            <div className="ada-stats-grid">
                {stats.map(stat => {
                    const StatIcon = stat.icon;
                    const ChangeIcon = stat.positive ? ArrowUpIcon : ArrowDownIcon;
                    return (
                        <div className="ada-stat-card" key={stat.id}>
                            <div className="ada-stat-header">
                                <span className="ada-stat-label">{stat.title}</span>
                                <div className="ada-stat-icon" style={{ background: `linear-gradient(135deg, ${stat.startColor}, ${stat.endColor})` }}>
                                    <StatIcon />
                                </div>
                            </div>
                            <div className="ada-stat-value">{stat.value}</div>
                            <div className={`ada-stat-change ${stat.positive ? 'ada-positive' : 'ada-negative'}`}>
                                <ChangeIcon style={{ width: '13px', height: '13px' }} />
                                <span>{stat.change}% from yesterday</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Active Alerts Section */}
            <div className="ada-alerts-section">
                <div className="ada-section-header">
                    <h2 className="ada-section-title">
                        <BellIcon style={{ width: '24px', height: '24px' }} />
                        Active Alerts
                    </h2>
                    <div className="ada-filter-tabs">
                        {ALERT_TYPES.map(type => (
                            <button
                                key={type}
                                className={`ada-filter-tab ${activeFilter === type ? 'ada-active' : ''}`}
                                onClick={() => setActiveFilter(type)}
                            >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="ada-alerts-grid" id="ada-alerts-container">
                    {renderAlertCards()}
                </div>
            </div>
        </div>
    );
};

export default ProfileAdmin;