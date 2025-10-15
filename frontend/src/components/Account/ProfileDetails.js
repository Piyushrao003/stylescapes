// frontend/src/components/Account/ProfileDetails.js

import React, { useState, useCallback, useEffect } from 'react';
import '../../styles/ProfileDetails.css';
// Import the actual API update function
import { updateUserProfile } from '../../api/userApi'; 

// --- Icon Components ---
const PencilIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);
// -------------------------------------------------------------------------------------

// CRITICAL: Component now accepts user and the update handler as props
const ProfileDetails = ({ user, onUserUpdateSuccess }) => {
    
    // State to hold and manage form data, initialized to safe defaults
    const [formData, setFormData] = useState({
        name: 'N/A',
        email: 'N/A',
        phone: 'N/A'
    });
    
    const [editMode, setEditMode] = useState(null); 
    const [originalValue, setOriginalValue] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- 1. DATA FETCHING (Initialization/Synchronization Logic) ---
    useEffect(() => {
        if (user) {
            // MAPPING: Use actual user object properties
            setFormData({
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
                email: user.email || 'N/A',
                phone: user.phone_number || '',
            });
            setError(null);
        }
    }, [user]);

    // --- 2. API SAVE LOGIC ---
    const handleSave = useCallback(async (fieldName) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Session expired. Please log in again.");
            setEditMode(null);
            return;
        }

        if (formData[fieldName] === originalValue) {
            setEditMode(null); 
            return;
        }
        
        setIsLoading(true);
        setError(null);

        // A. CONSTRUCT PAYLOAD
        let updatePayload = {};

        if (fieldName === 'name') {
            // Logic to split "John Doe" into { firstName: "John", lastName: "Doe" }
            const [firstName, ...lastNameParts] = formData.name.trim().split(/\s+/);
            const lastName = lastNameParts.join(' ');

            updatePayload = {
                firstName: firstName || '',
                lastName: lastName || ''
            };
        } else if (fieldName === 'phone') {
            updatePayload = {
                phoneNumber: formData.phone // Matches expected API field
            };
        } else if (fieldName === 'email') {
             setEditMode(null);
             setIsLoading(false);
             setError("Email update must be done via a dedicated security process.");
             return; 
        }

        // B. API CALL
        try {
            const response = await updateUserProfile(updatePayload, token);
            
            setEditMode(null);
            setIsLoading(false);
            
            if (onUserUpdateSuccess) {
                 // Sync global state with the updated user data returned from the API
                 onUserUpdateSuccess(response.updatedUser); 
            }
            

        } catch (err) {
            // Failure: Revert UI field to original value
            setFormData(prev => ({ ...prev, [fieldName]: originalValue }));
            setEditMode(null);
            setIsLoading(false);
            setError(err.message || "An unknown error occurred during saving.");
        }
    }, [formData, originalValue, onUserUpdateSuccess]);


    // --- 3. TOGGLE EDIT MODE (Now triggers handleSave on completion) ---
    const handleEditToggle = useCallback((fieldName) => {
        if (isLoading) return;
        
        // Block editing of Email for security
        if (fieldName === 'email') {
            
            return;
        }

        if (editMode === fieldName) {
            // Save mode - trigger save logic
            handleSave(fieldName);
        } else {
            // Edit mode - start editing
            setOriginalValue(formData[fieldName]);
            setEditMode(fieldName);
        }
    }, [editMode, formData, isLoading, handleSave]);


    // --- 4. HANDLE INPUT CHANGES ---
    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        const fieldName = id.replace('-input', '');
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        setError(null);
    }, []);


    // --- 5. RENDER HELPER (Uses provided class names) ---
    const renderField = (fieldName, label, type = 'text') => {
        const isEditing = editMode === fieldName;
        const inputId = `${fieldName}-input`;
        const isEmailField = fieldName === 'email';

        return (
            <div className="profileDetails-field" key={fieldName}>
                <div className="profileDetails-label">{label}</div>
                <div className="profileDetails-valueContainer">
                    <input
                        type={type}
                        id={inputId}
                        className="profileDetails-editableField"
                        value={formData[fieldName]}
                        onChange={handleChange}
                        readOnly={!isEditing || isEmailField || isLoading} // ReadOnly logic
                        onClick={() => !isEditing && handleEditToggle(fieldName)}
                        disabled={isLoading}
                    />
                    <button
                        className={`profileDetails-iconBtn ${isEditing ? 'active' : ''}`}
                        onClick={() => handleEditToggle(fieldName)}
                        disabled={isLoading || isEmailField} // Disable button for Email field
                        aria-label={isEditing ? 'Save' : 'Edit'}
                    >
                        {isEditing ? <CheckIcon /> : <PencilIcon />}
                    </button>
                </div>
            </div>
        );
    };

    if (!user) {
        // Fallback or early return handled by parent ProfilePage.js
        return null; 
    }

    return (
        <div className="profileDetails-content active" id="profile-details-content">
            <h2 className="profileDetails-sectionTitle">My Account</h2>

            <div className="profileDetails-card">
                <p className="profileDetails-description">
                    Manage your personal information, which is used for shipping and communication.
                </p>
                
                {error && <p style={{ color: 'var(--error-red)', marginBottom: '1rem', fontWeight: 600 }}>Error: {error}</p>}
                
                {renderField('name', 'Full Name', 'text')}
                {renderField('email', 'Email Address', 'email')}
                {renderField('phone', 'Mobile Number', 'tel')}

                {isLoading && (
                    <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--accent-blue)' }}>
                        Saving changes...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileDetails;