// D:\stylescapes\backend\src\services\policyService.js

const { db } = require('../config/firebase');

/**
 * @description Retrieves a specific policy document from the 'policies' collection.
 * @param {string} policyId - The ID of the policy (e.g., 'terms', 'privacy').
 * @returns {Promise<object|null>} The policy data or null if not found.
 */
exports.getPolicyById = async (policyId) => {
    try {
        const policyRef = db.collection('policies').doc(policyId);
        const policySnap = await policyRef.get();

        if (policySnap.exists) {
            return { id: policySnap.id, ...policySnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error retrieving policy:", error);
        throw new Error('Failed to fetch policy from database.');
    }
};

/**
 * @description Updates the content of an existing policy document, or creates it if it doesn't exist.
 * @param {string} policyId - The ID of the policy (e.g., 'terms').
 * @param {string} title - The title of the policy.
 * @param {string} policy_type - The type of the policy (e.g., 'Legal').
 * @param {string} content_html - The new HTML/Markdown content.
 * @returns {Promise<void>}
 */
exports.updatePolicyContent = async (policyId, title, policy_type, content_html) => {
    try {
        const policyRef = db.collection('policies').doc(policyId);
        const now = new Date().toISOString();

        // Check if document exists before trying to update
        const policySnap = await policyRef.get();
        
        if (!policySnap.exists) {
            // Document creation logic for first-time save
            await policyRef.set({
                title: title,
                policy_type: policy_type,
                content_html: content_html,
                created_at: now,
                updated_at: now
            });
        } else {
            // Update the existing document
            await policyRef.update({
                title: title,
                policy_type: policy_type,
                content_html: content_html,
                updated_at: now
            });
        }
    } catch (error) {
        console.error("Error updating policy:", error);
        throw new Error('Failed to update policy content.');
    }
};