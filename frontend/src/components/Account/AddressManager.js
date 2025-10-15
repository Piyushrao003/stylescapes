// frontend/src/components/Account/AddressManager.js

import React, { useState, useCallback, useEffect } from "react";
import "../../styles/AddressManager.css"; // Your CSS file
import { addAddress, updateAddress, deleteAddress } from "../../api/userApi";
// NOTE: Assume AddressForm.js is imported and correctly handles local form state
import AddressForm from "./AddressForm"; // ADDED/CONFIRMED IMPORT

// --- Address Card Component (Nested Helper) ---
const AddressCard = ({ addr, onDelete, onEdit, onSetDefault, isLoading }) => {
  // CRITICAL: Retaining original class names to match your CSS
  return (
    <div
      key={addr.id}
      className={`addressBook-card ${addr.is_default ? "default" : ""}`}
      data-id={addr.id}
    >
      <div>
        <div className="addressBook-header">
          {/* CRITICAL: Displaying backend snake_case fields correctly */}
          <h3>{addr.type || "Address"}</h3>
          {addr.is_default && (
            <span className="addressBook-primaryBadge">Primary Address</span>
          )}
        </div>
        <div className="addressBook-details">
          <p>
            <strong>{addr.name || "User"}</strong>
          </p>
          <p>{addr.address_line_1}</p>
          <p>{addr.address_line_2}</p>
          <p>
            {addr.city}, {addr.state} {addr.zip_code}
          </p>
        </div>
      </div>
      <div className="addressBook-actions">
        {addr.is_default ? (
          <button
            className="addressBook-btnSmall addressBook-btnDefault"
            disabled
          >
            Default
          </button>
        ) : (
          <button
            className="addressBook-btnSmall addressBook-btnDefault"
            onClick={() => onSetDefault(addr.id)}
            disabled={isLoading}
          >
            Make Default
          </button>
        )}
        <button
          className="addressBook-btnSmall addressBook-btnPrimary"
          onClick={() => onEdit(addr)}
          disabled={isLoading}
        >
          Edit
        </button>
        <button
          className="addressBook-btnSmall addressBook-btnDanger"
          onClick={() => onDelete(addr.id)}
          disabled={isLoading}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const AddressManager = ({ user, onUserUpdateSuccess }) => {
  // State is initialized from the user prop's addresses array
  const [addresses, setAddresses] = useState(user?.addresses || []);

  // Modal/State control
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null); // Address being edited (full object reference)
  const [formData, setFormData] = useState(null); // Data submitted from form (frontend-friendly keys)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // CRITICAL: Sync local state when the global user prop is updated
  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
    }
  }, [user?.addresses]);

  // --- 1. Address Deletion ---
  const handleDelete = useCallback(
    async (addressId) => {
      if (!window.confirm("Are you sure you want to delete this address?"))
        return;

      setIsLoading(true);
      setError(null);
      try {
        const updatedAddresses = await deleteAddress(addressId, token);
        setAddresses(updatedAddresses);
        // Trigger global user state refresh by sending the new addresses array
        onUserUpdateSuccess({ addresses: updatedAddresses });
      } catch (err) {
        setError(err.message || "Failed to delete address.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, onUserUpdateSuccess]
  );

  // --- 2. Set Default Address ---
  const handleSetDefault = useCallback(
    async (addressId) => {
      setIsLoading(true);
      setError(null);

      try {
        // API CALL: Send minimal payload { is_default: true }
        const updatedAddresses = await updateAddress(
          addressId,
          { is_default: true },
          token
        );
        setAddresses(updatedAddresses);
        onUserUpdateSuccess({ addresses: updatedAddresses });
        
      } catch (err) {
        setError(err.message || "Failed to set default address.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, onUserUpdateSuccess]
  );

  // --- 3. Form Modal Control and Data Mapping ---
  const handleOpenFormModal = useCallback((address = null) => {
    // When editing, map the snake_case data to frontend-friendly keys for AddressForm
    const initialData = address
      ? {
          id: address.id,
          type: address.type || "Home",
          line1: address.address_line_1,
          street: address.address_line_2,
          city: address.city,
          state: address.state,
          pin: address.zip_code,
          isNew: false,
        }
      : {
          // For adding new address, start with empty data
          isNew: true,
          type: "Home",
        };

    setCurrentAddress(address || null);
    setFormData(initialData); // Set data to be passed to the form
    setIsFormModalOpen(true);
  }, []);

  // --- 4. Two-Step Submission Flow ---

  // Step 1: User submits the form (AddressForm.js calls this with data in frontend-friendly keys)
  const handleFormSubmit = useCallback((data) => {
    setFormData(data); // Save the validated form data (frontend-friendly keys)
    setIsFormModalOpen(false); // Close form modal first
    setIsConfirmModalOpen(true); // Open confirmation modal
  }, []);

  // Step 2: User confirms the data -> Triggers API call
  const handleFinalSave = useCallback(async () => {
    const isEditMode = currentAddress !== null;

    // 1. Prepare Payload: Convert frontend names (formData) back to backend snake_case
    // formData still holds the data from AddressForm: { line1, street, city, state, pin, type }
    const payload = {
      address_line_1: formData.line1,
      address_line_2: formData.street,
      city: formData.city,
      state: formData.state,
      zip_code: formData.pin,
      type: formData.type, // Type is included for display/sorting purposes
    };

    // If adding the first address, ensure the default flag is set
    if (!isEditMode && addresses.length === 0) {
      payload.is_default = true;
    }

    setIsLoading(true);
    setError(null);

    try {
      let updatedAddresses;

      if (isEditMode) {
        // UPDATE: Send the existing ID and the payload
        updatedAddresses = await updateAddress(
          currentAddress.id,
          payload,
          token
        );
      } else {
        // ADD: Send the payload; backend generates the full object including ID/is_default
        updatedAddresses = await addAddress(payload, token);
      }

      // Success: Sync state and notify global context
      setAddresses(updatedAddresses);
      onUserUpdateSuccess({ addresses: updatedAddresses });

      setIsConfirmModalOpen(false);
     
    } catch (err) {
      setError(err.message || "Failed to save address.");
      setIsConfirmModalOpen(false);
      // Optional: Re-open form if error occurs, but closing is cleaner for modals
    } finally {
      setIsLoading(false);
    }
  }, [currentAddress, formData, addresses.length, token, onUserUpdateSuccess]);

  // Placeholder Modal component (Must use the original class names)
  // NOTE: This utility component is kept simple to wrap the Confirmation JSX
  const ConfirmationModal = ({
    isOpen,
    onClose,
    title,
    children,
    zIndex = 3000,
  }) => {
    if (!isOpen) return null;
    return (
      <div
        className="addressBook-modal"
        style={{
          display: "flex",
          zIndex: zIndex,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.8)",
        }}
      >
        <div
          className="addressBook-modalContent"
          style={{ margin: "5% auto", minHeight: "300px" }}
        >
          <span
            className="addressBook-closeBtn"
            style={{ float: "right", fontSize: "28px", cursor: "pointer" }}
            onClick={onClose}
          >
            &times;
          </span>
          <h2 className="addressBook-modalTitle">{title}</h2>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="addressBook-content active" id="addresses">
      <h2 className="addressBook-sectionTitle">Saved Addresses</h2>

      {error && (
        <p
          style={{
            color: "var(--error-red)",
            marginBottom: "1rem",
            fontWeight: 600,
          }}
        >
          Error: {error}
        </p>
      )}
      {isLoading && (
        <p style={{ color: "var(--accent-blue)", textAlign: "center" }}>
          Processing request...
        </p>
      )}

      <div className="addressBook-container" id="address-list-container">
        {addresses.map((addr) => (
          <AddressCard
            key={addr.id}
            addr={addr}
            onDelete={handleDelete}
            onEdit={handleOpenFormModal}
            onSetDefault={handleSetDefault}
            isLoading={isLoading}
          />
        ))}

        {/* Add New Address Card */}
        <div
          className="addressBook-addNewCard"
          onClick={() => handleOpenFormModal(null)}
        >
          <div className="addressBook-addContent">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <div>Add New Address</div>
          </div>
        </div>
      </div>

      {/* 1. Address Form Modal (Replaced placeholder with your requested JSX) */}
      {isFormModalOpen && (
        <div className="addressBook-modal">
          <div className="addressBook-modalContent">
            <span
              className="addressBook-closeBtn"
              onClick={() => setIsFormModalOpen(false)}
            >
              &times;
            </span>
            <h2>{currentAddress ? "Edit Address" : "Add New Address"}</h2>

            {/* Functional AddressForm Component */}
            <AddressForm
              // Pass the data mapped to frontend-friendly keys
              initialData={formData}
              // onSubmit triggers the confirmation modal
              onSubmit={handleFormSubmit}
              // onClose handles closing the form modal
              onClose={() => setIsFormModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Confirmation Modal */}
      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirm Address Change"
        >
          <div className="addressBook-modalContentInner">
            <p style={{ textAlign: "center", color: "var(--secondary-text)" }}>
              Confirm details for **{formData?.type || "new"}** address.
            </p>
            <div
              className="addressBook-details"
              style={{
                maxWidth: "300px",
                margin: "15px auto",
                padding: "15px",
                border: "1px solid var(--card-border)",
                borderRadius: "8px",
              }}
            >
              <p>{formData?.line1}</p>
              <p>{formData?.street}</p>
              <p>
                {formData?.city}, {formData?.state} {formData?.pin}
              </p>
            </div>
            <div
              className="addressBook-modalButtons"
              style={{ justifyContent: "center" }}
            >
              <button
                className="addressBook-btn addressBook-btnSecondary"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="addressBook-btn"
                onClick={handleFinalSave}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Confirm & Save"}
              </button>
            </div>
          </div>
        </ConfirmationModal>
      )}
    </div>
  );
};

export default AddressManager;
