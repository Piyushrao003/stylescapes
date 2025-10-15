// frontend/src/components/Orders/IssueReportForm.js

import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { submitSupportTicket } from "../../api/userApi"; // API call to POST /api/user/submit-ticket
import "../../styles/IssueReportForm.css";

// --- Icon Components (for better React rendering) ---
const InfoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);
const FileIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);
const ImageUploadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);
const SuccessIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// --- Component Definition ---

const ISSUE_TYPES = [
  {
    value: "damaged",
    title: "Damaged Product",
    desc: "Item arrived broken or damaged",
    icon: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  },
  {
    value: "wrong-item",
    title: "Wrong Item Received",
    desc: "Different product than ordered",
    icon: "M22 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z",
  },
  {
    value: "missing-items",
    title: "Missing Items",
    desc: "Some items are missing from package",
    icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  },
  {
    value: "size-fit",
    title: "Size/Fit Issue",
    desc: "Product doesn't fit as expected",
    icon: "M3 3h18v18H3z",
  },
  {
    value: "quality",
    title: "Quality Issues",
    desc: "Product quality not as described",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  },
  {
    value: "delivery",
    title: "Delivery Problem",
    desc: "Late delivery or delivery issues",
    icon: "M1 3h15v13H1z",
  },
  {
    value: "other",
    title: "Other Issue",
    desc: "Something else went wrong",
    icon: "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0",
  },
];

const IssueReportForm = ({ isOpen, onClose, orderId, user }) => {
  // Autofetching orderId feature implemented via props
  const [formData, setFormData] = useState({
    orderNumber: orderId || "",
    issueType: "",
    otherIssue: "",
    description: "",
    file: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("form"); // 'form' | 'success'
  const [submissionError, setSubmissionError] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState(null);

  // --- Utility: Admin Alert Function ---
  const sendAdminNotificationAlert = (reportId, type, order) => {
    const message = `
        🚨 NEW CUSTOMER ISSUE REPORT! 🚨
        
        Ticket ID: ${reportId}
        Order ID: ${order}
        Type: ${type}
        User: ${user.firstName || "User"} (${user.email})
        
        --- Action Required ---
        This requires immediate attention. Check the admin panel for details.
        `;
    // Use alert to demonstrate, as requested
    alert(message);
    console.log("Admin Notification Alert Sent.");
  };

  // --- State Handlers ---

  useEffect(() => {
    if (orderId) {
      setFormData((prev) => ({ ...prev, orderNumber: orderId }));
    }
  }, [orderId]);

  const handleChange = useCallback((e) => {
    const { id, value, name } = e.target;

    setSubmissionError(null);

    if (name === "issueType") {
      setFormData((prev) => ({
        ...prev,
        issueType: value,
        otherIssue: value !== "other" ? "" : prev.otherIssue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
    // Manually reset file input value for re-upload
    document.getElementById("fileUpload").value = "";
  };

  // --- Form Submission Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);

    // Client-side validation checks
    if (!formData.issueType || !formData.description || !formData.orderNumber) {
      setSubmissionError(
        "Please fill in the Order Number, Issue Type, and Description."
      );
      return;
    }
    if (formData.issueType === "other" && !formData.otherIssue) {
      setSubmissionError(
        "Please describe your specific issue in the 'Other Issue' field."
      );
      return;
    }

    setIsLoading(true);

    try {
      // 1. Prepare data for the backend
      const selectedIssue = ISSUE_TYPES.find(
        (i) => i.value === formData.issueType
      );
      const complaintTitle = selectedIssue?.title || formData.issueType;

      const description =
        formData.issueType === "other"
          ? `Other issue: ${formData.otherIssue}\n\nDetails: ${formData.description}`
          : formData.description;

      const token = localStorage.getItem("token");

      const ticketData = {
        complaintType: complaintTitle,
        queryType: formData.issueType,
        description: description,
        related_id: formData.orderNumber,
        priority: "MEDIUM",
      };

      const response = await submitSupportTicket(ticketData, token);

      // 2. Success: Update state and trigger notification
      const reportId = response.ticket?.ticket_id || `REF-${Date.now()}`;

      setReferenceNumber(reportId);
      sendAdminNotificationAlert(
        reportId,
        complaintTitle,
        formData.orderNumber
      ); // <-- NEW: ADMIN ALERT
      setCurrentStep("success");
    } catch (error) {
      console.error("Issue Submission Error:", error);
      setSubmissionError(
        error.response?.data?.message ||
          "Failed to submit report. Please try again later."
      );
      setCurrentStep("form");
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX Render Helpers ---

  const renderIssueOptions = () => (
    <div className="irf-options-grid">
      {ISSUE_TYPES.map((issue) => (
        <label
          key={issue.value}
          className={`irf-option-card ${
            formData.issueType === issue.value ? "irf-selected" : ""
          }`}
        >
          <input
            type="radio"
            name="issueType"
            value={issue.value}
            checked={formData.issueType === issue.value}
            onChange={handleChange}
            required={issue.value === ISSUE_TYPES[0].value}
            disabled={isLoading}
          />
          <div className="irf-option-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {issue.icon.includes("M") ? (
                <path d={issue.icon} />
              ) : (
                <circle cx="12" cy="12" r="10" />
              )}
            </svg>
          </div>
          <div className="irf-option-content">
            <div className="irf-option-title">{issue.title}</div>
            <div className="irf-option-description">{issue.desc}</div>
          </div>
        </label>
      ))}
    </div>
  );

  const fileSizeFormatted = formData.file
    ? (formData.file.size / (1024 * 1024)).toFixed(2) + " MB"
    : "";

  return (
    <div className="irf-modal-overlay">
      <div className="irf-form-container">
        <button
          type="button"
          className="irf-close-btn"
          onClick={onClose}
          disabled={isLoading}
        >
          &times;
        </button>

        {/* --- Form Content --- */}
        <div
          id="formContent"
          style={{ display: currentStep === "form" ? "block" : "none" }}
        >
          <div className="irf-form-header">
            <div className="irf-form-icon">
              <InfoIcon />
            </div>
            <h1 className="irf-form-title">Report an Issue</h1>
            <p className="irf-form-subtitle">
              We're here to help. Tell us what went wrong.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {submissionError && (
              <p className="irf-error-message" style={{ marginBottom: "1rem" }}>
                {submissionError}
              </p>
            )}

            {/* Order Number (Autofetched and ReadOnly) */}
            <div className="irf-form-group">
              <label className="irf-form-label" htmlFor="orderNumber">
                Order Number<span className="irf-required">*</span>
              </label>
              <input
                type="text"
                id="orderNumber"
                className="irf-form-input"
                value={formData.orderNumber}
                readOnly
                disabled
              />
              <p className="irf-helper-text">
                This order ID is automatically fetched.
              </p>
            </div>

            {/* Issue Type */}
            <div className="irf-form-group">
              <label className="irf-form-label">
                What's the issue?<span className="irf-required">*</span>
              </label>
              {renderIssueOptions()}

              {/* Other Issue Description (Conditional Input) */}
              <div
                className={`irf-other-input-container ${
                  formData.issueType === "other" ? "irf-active" : ""
                }`}
                id="otherInputContainer"
              >
                <label
                  className="irf-form-label"
                  htmlFor="otherIssue"
                  style={{ marginTop: "1rem" }}
                >
                  Please describe your issue
                  <span className="irf-required">*</span>
                </label>
                <input
                  type="text"
                  id="otherIssue"
                  className="irf-form-input"
                  value={formData.otherIssue}
                  onChange={handleChange}
                  placeholder="Type your issue here..."
                  required={formData.issueType === "other"}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div className="irf-form-group">
              <label className="irf-form-label" htmlFor="description">
                Detailed Description<span className="irf-required">*</span>
              </label>
              <textarea
                id="description"
                className="irf-form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please provide more details about the issue..."
                required
                disabled={isLoading}
              ></textarea>
              <p className="irf-helper-text">
                Help us understand the problem better with specific details
              </p>
            </div>

            {/* File Upload */}
            <div className="irf-form-group">
              <label className="irf-form-label">Add Photos (Optional)</label>
              <div className="irf-file-upload-wrapper">
                <input
                  type="file"
                  id="fileUpload"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                {/* Note the addition of the trailing slash: ^ */}
                <div className="irf-file-upload-icon">
                  <ImageUploadIcon />
                </div>
                <p className="irf-file-upload-text">
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p className="irf-file-upload-hint">PNG, JPG up to 10MB</p>
              </div>

              {/* File Preview */}
              <div
                className={`irf-file-preview ${
                  formData.file ? "irf-active" : ""
                }`}
              >
                <div className="irf-file-info">
                  <div className="irf-file-icon">
                    <FileIcon />
                  </div>
                  <div className="irf-file-details">
                    <div className="irf-file-name">{formData.file?.name}</div>
                    <div className="irf-file-size">{fileSizeFormatted}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="irf-remove-file"
                  onClick={handleRemoveFile}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="irf-form-actions">
              <button
                type="button"
                className="irf-btn irf-btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="irf-btn irf-btn-primary"
                disabled={isLoading}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 2L11 13"></path>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
                </svg>
                {isLoading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>

        {/* --- Success Message --- */}
        <div
          className={`irf-success-message ${
            currentStep === "success" ? "irf-active" : ""
          }`}
        >
          <div className="irf-success-icon">
            <SuccessIcon />
          </div>
          <h2 className="irf-success-title">Report Submitted!</h2>
          <p className="irf-success-text">
            We've received your issue report and will get back to you within
            24-48 hours.
          </p>
          <div className="irf-reference-number">{referenceNumber}</div>
          <button className="irf-btn irf-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueReportForm;
