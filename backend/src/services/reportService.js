// D:\stylescapes\backend\src\services\reportService.js

const { db } = require('../config/firebase');
const { generateStscId } = require('../models/Report'); // Import the utility from the model

// The reports collection will handle all three report types (Support, Review, Metrics)
const REPORTS_COLLECTION = 'admin_metrics';

/**
 * @description Retrieves a filtered list of reports/tickets for the Admin.
 * @param {object} filters - Optional filters (e.g., status, type, priority).
 * @returns {Promise<Array>} An array of report documents.
 */
exports.getReports = async (filters = {}) => {
    try {
        let query = db.collection(REPORTS_COLLECTION);
        
        // Example filtering based on status (essential for admin)
        if (filters.status) {
            query = query.where('status', '==', filters.status);
        }
        
        // Example filtering based on type
        if (filters.type) {
             query = query.where('type', '==', filters.type);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Error retrieving reports:", error);
        throw new Error('Failed to retrieve reports from database.');
    }
};


/**
 * @description Creates a new support ticket (user-submitted complaint/review report).
 * @param {string} userId - The ID of the user submitting the ticket.
 * @param {object} ticketData - Data including subject, description, category, and related_id.
 * @returns {Promise<object>} The created ticket object.
 */
exports.createSupportTicket = async (userId, ticketData) => {
    try {
        const newTicket = {
            ticket_id: generateStscId(),
            user_id: userId,
            type: ticketData.type || 'CUSTOMER_COMPLAINT', // Default to complaint
            category: ticketData.category || 'OTHER',
            subject: ticketData.subject,
            description: ticketData.description,
            related_id: ticketData.related_id || null, 
            
            status: 'OPEN',
            priority: 'MEDIUM', // Default priority for user-submitted tickets
            
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const docRef = await db.collection(REPORTS_COLLECTION).add(newTicket);
        return { docId: docRef.id, ...newTicket };

    } catch (error) {
        console.error("Error creating support ticket:", error);
        throw new Error('Failed to create support ticket.');
    }
};


/**
 * @description Logs a system-generated administrative metric/alert (e.g., STOCK_LOW, API_LATENCY).
 * @param {string} category - The alert type (e.g., 'STOCK_LOW', 'CART_ABANDONMENT').
 * @param {object} payload - Structured data payload.
 * @returns {Promise<object>} The created metric object.
 */
exports.logAdminMetric = async (category, subject, payload) => {
    try {
        const newMetric = {
            ticket_id: generateStscId(),
            type: 'ADMIN_METRIC',
            category: category,
            subject: subject,
            description: `System alert for ${category}. Current value: ${payload.current_value}.`, 
            data_payload: payload,
            
            status: 'OPEN',
            priority: payload.priority || 'LOW', // Allow service caller to set priority
            
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const docRef = await db.collection(REPORTS_COLLECTION).add(newMetric);
        return { docId: docRef.id, ...newMetric };

    } catch (error) {
        console.error("Error logging admin metric:", error);
        // We throw a silent error here as metric logging should not typically halt app execution
        throw new Error('Failed to log admin metric.');
    }
};
