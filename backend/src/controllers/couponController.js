// D:\stylescapes\backend\src\controllers\couponController.js

const couponService = require('../services/couponService');
const { verifyAdmin } = require('../middleware/authMiddleware');
const { db } = require('../config/firebase');

// GET /api/coupons - Admin-only route to get all coupons
exports.getCoupons = async (req, res) => {
    try {
        // CORRECT: Using the collection().get() syntax from Admin SDK
        const couponsQuerySnapshot = await db.collection('coupons').get();
        const coupons = couponsQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(coupons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// POST /api/coupons - Admin-only route to create a new coupon
exports.createCoupon = async (req, res) => {
    try {
        const couponData = req.body;
        const newCoupon = await couponService.createCoupon(couponData);
        res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// PUT /api/coupons/:id - Admin-only route to update a coupon
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const couponData = req.body;
        // CORRECT: Using the collection().doc().update() syntax from Admin SDK
        const couponRef = db.collection('coupons').doc(id);
        await couponRef.update({
            ...couponData,
            updated_at: new Date().toISOString()
        });
        res.status(200).json({ message: 'Coupon updated successfully', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// DELETE /api/coupons/:id - Admin-only route to delete a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        // CORRECT: Using the collection().doc().delete() syntax from Admin SDK
        const couponRef = db.collection('coupons').doc(id);
        await couponRef.delete();
        res.status(200).json({ message: 'Coupon deleted successfully', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
