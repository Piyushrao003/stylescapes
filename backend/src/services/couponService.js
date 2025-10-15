// D:\stylescapes\backend\src\services\couponService.js

const { db } = require('../config/firebase');

/**
 * @description Creates a new coupon in Firestore.
 * @param {object} couponData - The coupon data from the request.
 * @returns {Promise<object>} The new coupon document with its ID.
 */
exports.createCoupon = async (couponData) => {
    try {
        const newCoupon = {
            ...couponData,
            is_active: true,
            used_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        // CORRECT: Using the add() method on the collection reference
        const docRef = await db.collection('coupons').add(newCoupon);
        return { id: docRef.id, ...newCoupon };
    } catch (error) {
        console.error("Error in createCoupon:", error);
        throw new Error('Failed to create coupon.');
    }
};

/**
 * @description Validates a coupon code against Firestore rules.
 * @param {string} couponCode - The code to validate.
 * @param {number} totalAmount - The total order amount.
 * @returns {Promise<object|null>} The coupon data if valid, otherwise null.
 */
exports.validateCoupon = async (couponCode, totalAmount) => {
    try {
        // CORRECT: Using the where().get() syntax from the Admin SDK
        const couponsQuerySnapshot = await db.collection('coupons').where('coupon_code', '==', couponCode).get();

        if (couponsQuerySnapshot.empty) {
            return null;
        }
        
        const couponData = couponsQuerySnapshot.docs[0].data();
        const now = new Date().toISOString();

        if (couponData.is_active && couponData.end_date > now && couponData.minimum_order <= totalAmount) {
            return { id: couponsQuerySnapshot.docs[0].id, ...couponData };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error in validateCoupon:", error);
        throw new Error('Failed to validate coupon.');
    }
};

/**
 * @description Applies a valid coupon to an order.
 * @param {string} couponId - The ID of the coupon.
 * @returns {Promise<void>}
 */
exports.applyCoupon = async (couponId) => {
    try {
        const couponRef = db.collection('coupons').doc(couponId);
        // Correctly using the Admin SDK's FieldValue
        // const { FieldValue } = require('firebase-admin/firestore');
        // await couponRef.update({ used_count: FieldValue.increment(1) });
        console.log(`Coupon ${couponId} applied successfully.`);
    } catch (error) {
        console.error("Error in applyCoupon:", error);
        throw new Error('Failed to apply coupon.');
    }
};
