// D:\stylescapes\frontend\src\pages\PolicyPage.js

import React, { useState, useEffect } from 'react';
import { getPolicy, updatePolicy } from '../api/policiesApi'; 
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/PolicyPage.css';

const POLICY_MENU = [
    { id: 'terms', title: 'Terms & Conditions', policy_type: 'Legal' },
    { id: 'privacy', title: 'Privacy Policy', policy_type: 'Legal' },
    { id: 'returns', title: 'Return Policy', policy_type: 'Operational' },
    { id: 'shipping', title: 'Shipping Policy', policy_type: 'Operational' },
    { id: 'payment', title: 'Payment Policy', policy_type: 'Financial' },
    { id: 'legal', title: 'Legal Disclaimer', policy_type: 'Legal' },
    { id: 'ip', title: 'Intellectual Property', policy_type: 'Legal' },
];

// Helper function to convert plain text line breaks to HTML
const formatPlainTextToHTML = (text) => {
    if (!text) return '';
    
    // Check if content already has HTML tags
    if (text.includes('<h') || text.includes('<p>') || text.includes('<ul>')) {
        return text; // Already formatted HTML
    }
    
    // Convert plain text with line breaks to HTML paragraphs
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join('');
};

const PolicyPage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const activePolicyId = id || 'terms'; 

    const [policyData, setPolicyData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editorData, setEditorData] = useState({
        content_html: '',
        title: '',
        policy_type: 'Legal' 
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false); 

    const isUserAdmin = user && user.role === 'admin';

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleLinkClick = (policyId) => {
        navigate(`/policies/${policyId}`); 
        setSidebarOpen(false);
    };
    
    // --- FETCH DATA ---
    useEffect(() => {
        const fetchPolicy = async () => {
            setIsLoading(true);
            setError(null);
            
            const defaultPolicy = POLICY_MENU.find(p => p.id === activePolicyId) || POLICY_MENU[0];
            
            // Define structured placeholder content
            const structuredPlaceholder = 
                `<h1>${defaultPolicy.title}</h1>\n` +
                `<p>This is the initial draft content for the <strong>${defaultPolicy.title}</strong> policy. Please structure your content using basic HTML tags like &lt;p&gt;, &lt;h2&gt;, and &lt;ul&gt; for proper formatting.</p>\n` +
                `<h2>1. Scope and Use</h2>\n` +
                `<p>By accessing this platform, you agree to adhere to these terms.</p>\n` +
                `<h2>2. Important Clauses</h2>\n` +
                `<ul>\n` +
                `  <li>Liability is limited to the cost of goods.</li>\n` +
                `  <li>All content is proprietary property.</li>\n` +
                `</ul>\n`;

            try {
                const data = await getPolicy(activePolicyId);
                
                setPolicyData(data);
                setLastUpdated(data.updated_at);
                
                setEditorData({
                    content_html: data.content_html || structuredPlaceholder,
                    title: data.title || defaultPolicy.title,
                    policy_type: data.policy_type || defaultPolicy.policy_type
                });

            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setPolicyData(null);
                    setLastUpdated(null);
                    setEditorData({
                        content_html: structuredPlaceholder,
                        title: defaultPolicy.title,
                        policy_type: defaultPolicy.policy_type
                    });
                } else {
                    setError(`Failed to load policy: ${err.message}.`);
                }
            } finally {
                setIsLoading(false);
                setIsEditing(false);
                setSidebarOpen(false); 
            }
        };

        fetchPolicy();
    }, [activePolicyId]); 

    // --- ADMIN HANDLERS ---
    const handleEditToggle = () => {
        setIsEditing(prev => !prev);
    };

    const handleSavePolicy = async () => {
        setShowConfirmation(false);
        setIsLoading(true);
        setError(null);

        if (!editorData.content_html || !editorData.title || !editorData.policy_type) {
            setError("Title, Type, and Content fields must be filled out.");
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication failure. Token missing.");

            const response = await updatePolicy(activePolicyId, editorData, token);
            
            setPolicyData({ 
                ...policyData, 
                ...editorData, 
                updated_at: response.last_updated
            });
            setLastUpdated(response.last_updated);
            setIsEditing(false);
            alert(`Policy '${editorData.title}' updated successfully!`);

        } catch (err) {
            console.error("Save Policy Error:", err);
            setError("Failed to save policy. Check your token/permissions.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- RENDER SECTIONS ---
    const renderPolicyContent = () => {
        const content = policyData?.content_html || editorData.content_html;
        
        if (isEditing) {
            // Admin Edit View
            return (
                <div className="policy-editor-view">
                    {/* Admin Input Group for Title/Type */}
                    <div className="admin-input-group">
                        <label>Policy Title:</label>
                        <input 
                            type="text" 
                            value={editorData.title} 
                            onChange={(e) => setEditorData({...editorData, title: e.target.value})} 
                        />
                        <label>Policy Type:</label>
                        <select 
                            value={editorData.policy_type} 
                            onChange={(e) => setEditorData({...editorData, policy_type: e.target.value})}
                        >
                            <option value="Legal">Legal</option>
                            <option value="Operational">Operational</option>
                            <option value="Financial">Financial</option>
                        </select>
                    </div>

                    <textarea
                        className="policy-editor-textarea"
                        value={editorData.content_html}
                        onChange={(e) => setEditorData({...editorData, content_html: e.target.value})}
                        placeholder={`Start writing the content for the ${editorData.title} policy here...`}
                    />
                </div>
            );
        }

        // Public Read View - with line break formatting
        return (
            <div className="policy-content-display">
                {content ? (
                    <div dangerouslySetInnerHTML={{ 
                        __html: formatPlainTextToHTML(content)
                    }} />
                ) : (
                    <p className="no-content-message">Content for this policy is currently unavailable.</p>
                )}
            </div>
        );
    };

    return (
        <div className="policy-page-wrapper">
            
            {/* 1. Mobile Hamburger Button */}
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            
            {/* 2. Sidebar Overlay (for closing on mobile) */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>

            {/* 3. Sidebar Navigation */}
            <div className={`policy-sidebar ${sidebarOpen ? 'active' : ''}`}>
                <h3 className="sidebar-title">Policy Center</h3>
                <nav className="policy-nav">
                    {POLICY_MENU.map((policyItem) => (
                        <a
                            key={policyItem.id}
                            className={`policy-nav-item ${activePolicyId === policyItem.id ? 'active' : ''}`}
                            onClick={() => handleLinkClick(policyItem.id)}
                        >
                            {policyItem.title}
                        </a>
                    ))}
                    
                    {/* Admin Feature: Placeholder for adding new policy types */}
                    {isUserAdmin && (
                        <button className="admin-add-button" title="Feature requires Admin backend to manage policy IDs.">
                            + Add New Policy Type
                        </button>
                    )}
                </nav>
            </div>
            
            {/* 4. Main Content Area */}
            <div className="policy-main-content">
                
                {/* Header and Metadata */}
                <div className="policy-header-area">
                    <h1 className="main-policy-title">{policyData?.title || editorData.title || 'Terms and Conditions'}</h1>
                    <div className="policy-metadata-header">
                        <p className="policy-type">
                            Type: <strong>{policyData?.policy_type || editorData.policy_type}</strong>
                        </p>
                        <p className="last-updated">
                            Last Updated: <strong>{formatDate(lastUpdated)}</strong>
                        </p>
                    </div>
                </div>

                {/* Admin Control Buttons */}
                {isUserAdmin && (
                    <div className="admin-actions-bar">
                        {isEditing ? (
                            <>
                                <button onClick={handleEditToggle} className="btn-secondary-policy">Cancel Edit</button>
                                <button onClick={() => setShowConfirmation(true)} className="btn-primary-policy" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Submit Changes'}
                                </button>
                            </>
                        ) : (
                            <button onClick={handleEditToggle} className="btn-secondary-policy">Edit Policy</button>
                        )}
                    </div>
                )}
                
                {/* Policy Content / Editor */}
                <div className="policy-content-container">
                    {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                    {renderPolicyContent()}
                </div>
            </div>

            {/* 5. Confirmation Modal */}
            {showConfirmation && (
                <div className="modal-overlay-policy">
                    <div className="modal-content-policy">
                        <h3>Confirm Policy Update</h3>
                        <p>Are you sure you want to save and publish these changes for the **{editorData.title}** policy?</p>
                        <div className="modal-actions-policy">
                            <button onClick={() => setShowConfirmation(false)} className="btn-secondary-policy">No, Review</button>
                            <button onClick={handleSavePolicy} className="btn-primary-policy">Yes, Save & Publish</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyPage;