// D:\stylescapes\backend\src\controllers\shippingController.js

const shippingService = require('../services/shippingService');
const { verifyAdmin } = require('../middleware/authMiddleware');

// GET /api/shipping - Public route to get all active shipping methods
exports.getShippingMethods = async (req, res) => {
    try {
        const methods = await shippingService.getAllShippingMethods();
        res.status(200).json(methods);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// POST /api/shipping - Admin-only route to create a new shipping method
exports.createShippingMethod = async (req, res) => {
    try {
        const methodData = req.body;
        const newMethod = await shippingService.createShippingMethod(methodData);
        res.status(201).json({ message: 'Shipping method created successfully', method: newMethod });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// PUT /api/shipping/:id - Admin-only route to update a shipping method
exports.updateShippingMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const methodData = req.body;
        const updatedMethod = await shippingService.updateShippingMethod(id, methodData);
        res.status(200).json({ message: 'Shipping method updated successfully', method: updatedMethod });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
