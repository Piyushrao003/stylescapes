// D:\stylescapes\backend\src\services\transactionService.js

const { db } = require('../config/firebase');

/**
 * @description Adds a new transaction record to Firestore.
 * This is typically called by a webhook from a payment gateway.
 * @param {object} transactionData - The transaction data from the payment gateway.
 * @returns {Promise<object>} The new transaction document with its ID.
 */
exports.addTransaction = async (transactionData) => {
    try {
        const newTransaction = {
            ...transactionData,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
        };
        // CORRECT: Calling the add() method on the collection reference
        const docRef = await db.collection('transactions').add(newTransaction);
        return { id: docRef.id, ...newTransaction };
    } catch (error) {
        console.error("Error in addTransaction:", error);
        throw new Error('Failed to record transaction.');
    }
};

/**
 * @description Retrieves a single transaction record by its ID.
 * @param {string} transactionId - The ID of the transaction to retrieve.
 * @returns {Promise<object|null>} The transaction document or null if not found.
 */
exports.getTransactionById = async (transactionId) => {
    try {
        const transactionRef = db.collection('transactions').doc(transactionId);
        const transactionSnap = await transactionRef.get();

        if (transactionSnap.exists) {
            return { id: transactionSnap.id, ...transactionSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error in getTransactionById:", error);
        throw new Error('Failed to retrieve transaction details.');
    }
};
