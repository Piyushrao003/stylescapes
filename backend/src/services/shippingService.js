// D:\stylescapes\backend\src\services\shippingService.js

const { db } = require('../config/firebase');

/**
 * @description Retrieves all shipping methods from Firestore.
 * @returns {Promise<Array>} An array of all shipping method documents.
 */
exports.getAllShippingMethods = async () => {
    try {
        const shippingCollectionRef = db.collection('shippingMethods');
        const shippingSnapshot = await shippingCollectionRef.get();
        const methods = shippingSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return methods;
    } catch (error) {
        console.error("Error in getAllShippingMethods:", error);
        throw new Error('Failed to retrieve shipping methods.');
    }
};

/**
 * @description Creates a new shipping method in Firestore.
 * @param {object} methodData - The shipping method data to save.
 * @returns {Promise<object>} The new method document with its ID.
 */
exports.createShippingMethod = async (methodData) => {
    try {
        const newMethod = {
            ...methodData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        const docRef = await db.collection('shippingMethods').add(newMethod);
        return { id: docRef.id, ...newMethod };
    } catch (error) {
        console.error("Error in createShippingMethod:", error);
        throw new Error('Failed to create shipping method.');
    }
};

/**
 * @description Updates an existing shipping method.
 * @param {string} methodId - The ID of the method to update.
 * @param {object} methodData - The new data for the shipping method.
 * @returns {Promise<object>} The updated method document with its ID.
 */
exports.updateShippingMethod = async (methodId, methodData) => {
    try {
        const methodRef = db.collection('shippingMethods').doc(methodId);
        const updatedMethod = {
            ...methodData,
            updated_at: new Date().toISOString()
        };
        await methodRef.update(updatedMethod);
        return { id: methodId, ...updatedMethod };
    } catch (error) {
        console.error("Error in updateShippingMethod:", error);
        throw new Error('Failed to update shipping method.');
    }
};
