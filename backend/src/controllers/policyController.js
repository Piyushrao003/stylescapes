// D:\stylescapes\backend\src\controllers\policyController.js

const policyService = require('../services/policyService');
// Import verifyAdmin, though it is usually handled in the route layer for Express
const { verifyAdmin } = require('../middleware/authMiddleware'); 

/**
 * @description GET /api/policies/:id - Public route to retrieve policy content.
 * This is used by all users (public and admin) to display the current policy.
 */
exports.getPolicy = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Input validation: Ensure the ID is safe and expected (e.g., 'terms', 'privacy')
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ message: 'Invalid policy identifier.' });
        }
        
        const policy = await policyService.getPolicyById(id);

        if (policy) {
            // Success: Return the policy document
            res.status(200).json(policy);
        } else {
            // Not found in database
            res.status(404).json({ message: `Policy '${id}' not found. Please create it first.` });
        }
    } catch (error) {
        console.error("Policy retrieval error:", error);
        // Log the internal error but return a generic 500 to the client
        res.status(500).json({ message: 'Internal Server Error during policy fetch.' });
    }
};

/**
 * @description PUT /api/policies/:id - Admin-only route to update policy content.
 * Access is protected by verifyAdmin middleware in the router.
 */
exports.updatePolicy = async (req, res) => {
    // This function only runs if the user has already been verified as an Admin 
    // by the middleware.
    try {
        const { id } = req.params;
        const { content_html, title, policy_type } = req.body;

        // Validation of required fields
        if (!content_html || !title || !policy_type) {
            return res.status(400).json({ message: 'Title, Type, and Content are required for update.' });
        }
        
        // Call service layer to save data
        await policyService.updatePolicyContent(id, title, policy_type, content_html);

        res.status(200).json({ 
            message: `Policy '${id}' updated successfully.`,
            updated_by: req.user.uid, // Demonstrating that the user object is available
            last_updated: new Date().toISOString() 
        });
    } catch (error) {
        console.error("Policy update error:", error);
        res.status(500).json({ message: 'Internal Server Error during policy update.' });
    }
};
