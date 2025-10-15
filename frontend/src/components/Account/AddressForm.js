// frontend/src/components/Account/AddressForm.js

import React, { useState, useCallback, useEffect } from 'react'; // Added useCallback and useEffect for cleaner logic
import '../../styles/AddressForm.css';

/**
 * Renders the form for adding or editing a user address.
 * It handles local state, validation, and geolocation, but delegates
 * the final API submission to the parent component (AddressManager).
 */
const AddressForm = ({ initialData, onSubmit, onClose }) => {

    // CRITICAL: Initialize state using the nested schema structure
    // NOTE: Uses optional chaining (?) as a safety measure for initialData
    const [formData, setFormData] = useState({
        type: initialData?.type || 'Home',
        line1: initialData?.line1 || '', // Maps to address_line_1
        street: initialData?.street || '', // Maps to address_line_2
        city: initialData?.city || '',
        state: initialData?.state || '',
        pin: initialData?.pin || '' // Maps to zip_code
    });

    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState(null);

    // --- 1. Handle Input Changes ---
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        setError(null);
    };

    // --- 2. Handle Form Submission ---
    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.type || !formData.line1 || !formData.street ||
            !formData.city || !formData.state || !formData.pin) {
            setError('Please fill in all required address fields.');
            return;
        }

        if (formData.pin.length !== 6 || !/^\d+$/.test(formData.pin)) {
            setError('PIN code must be a 6-digit number.');
            return;
        }

        // Pass data to parent (AddressManager.js) which handles API logic
        onSubmit(formData);
    };

    // --- 3. Detect Location using GPS + Nominatim ---
    const detectLocation = useCallback(async (e) => {
        e.preventDefault();
        
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setIsDetecting(true);
        setError(null);

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    // API Call for Reverse Geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
                    );
                    const data = await response.json();

                    if (response.ok && data?.address) {
                        const addr = data.address;

                        setFormData(prev => ({
                            ...prev,
                            line1: addr.house_number || addr.building || '', // House number/Building name
                            street: addr.road || addr.suburb || addr.neighbourhood || '', // Street address/Locality
                            city: addr.city || addr.town || addr.village || addr.county || '',
                            state: addr.state || '',
                            pin: addr.postcode || ''
                        }));

                       
                    } else {
                        setError('Could not fetch detailed address. Please enter manually.');
                    }
                } catch (err) {
                    setError('Error connecting to the geocoding service.');
                } finally {
                    setIsDetecting(false);
                }
            },
            (err) => {
                setError('Unable to detect location. Please enable location services and try again.');
                setIsDetecting(false);
            },
            options
        );
    }, []); // Empty dependency array means this function is stable

    // --- JSX Structure ---
    return (
        <form onSubmit={handleSubmit} className="addressForm-container">
            
            {/* Address Type Dropdown */}
            <div className="addressForm-group">
                <label htmlFor="type">Address Type</label>
                <select 
                    id="type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    required
                    disabled={isDetecting}
                >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Detect Location Button */}
            <button 
                type="button"
                className="addressForm-detectBtn" 
                onClick={detectLocation}
                disabled={isDetecting}
            >
                {/* SVG Icon */}
                <svg 
                    className="addressForm-detectIcon"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                </svg>
                {isDetecting ? (
                    <>
                        <span className="addressForm-spinner"></span>
                        Detecting Location...
                    </>
                ) : (
                    'Use Current Location'
                )}
            </button>

            {/* House/Building Input */}
            <div className="addressForm-group">
                <label htmlFor="line1">House/Flat No. & Building Name</label>
                <input 
                    type="text" 
                    id="line1" 
                    value={formData.line1} 
                    onChange={handleChange} 
                    required 
                    placeholder="House No., Building/Society Name"
                    disabled={isDetecting}
                />
            </div>

            {/* Street Input */}
            <div className="addressForm-group">
                <label htmlFor="street">Street Address / Road</label>
                <input 
                    type="text" 
                    id="street" 
                    value={formData.street} 
                    onChange={handleChange} 
                    required 
                    placeholder="Street Name, Locality"
                    disabled={isDetecting}
                />
            </div>

            {/* City & State Grid */}
            <div className="addressForm-grid">
                <div className="addressForm-group">
                    <label htmlFor="city">City</label>
                    <input 
                        type="text" 
                        id="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        required 
                        placeholder="City"
                        disabled={isDetecting}
                    />
                </div>
                <div className="addressForm-group">
                    <label htmlFor="state">State</label>
                    <input 
                        type="text" 
                        id="state" 
                        value={formData.state} 
                        onChange={handleChange} 
                        required 
                        placeholder="State"
                        disabled={isDetecting}
                    />
                </div>
            </div>

            {/* PIN Code Input */}
            <div className="addressForm-group">
                <label htmlFor="pin">PIN Code</label>
                <input 
                    type="text" 
                    id="pin" 
                    value={formData.pin} 
                    onChange={handleChange} 
                    required 
                    placeholder="123456"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    disabled={isDetecting}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="addressForm-error">
                    {error}
                </div>
            )}

            {/* Form Buttons */}
            <div className="addressForm-buttons">
                <button 
                    type="button" 
                    className="addressForm-btn addressForm-btnSecondary"
                    onClick={onClose}
                    disabled={isDetecting}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="addressForm-btn addressForm-btnPrimary"
                    disabled={isDetecting}
                >
                    Save Address
                </button>
            </div>
        </form>
    );
};

export default AddressForm;