// D:\stylescapes\backend\src\models\Policy.js

const Policy = {
    // Unique ID from Firestore (e.g., 'terms', 'privacy', 'returns')
    id: String,

    // Policy identification (e.g., 'Terms and Conditions of Service')
    title: String,
    
    // NEW: Categorizes the policy type for clarity (e.g., 'Legal', 'Operational', 'Financial')
    policy_type: String, 

    // The editable content, stored as a string (HTML or Markdown)
    content_html: String,
    
    // Timestamps for tracking changes
    created_at: String,
    updated_at: String,
};

module.exports = Policy;
