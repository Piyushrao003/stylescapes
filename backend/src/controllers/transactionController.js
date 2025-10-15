// D:\stylescapes\backend\src\controllers\transactionController.js

const transactionService = require('../services/transactionService');
const { verifyAdmin } = require('../middleware/authMiddleware');

// This is a special endpoint, typically used by a payment gateway's webhook.
// It is public so the external service can send data without authentication.
// Endpoint: POST /api/transactions/webhook
exports.recordTransaction = async (req, res) => {
    try {
        const transactionData = req.body;
        const newTransaction = await transactionService.addTransaction(transactionData);
        res.status(201).json({ message: 'Transaction recorded successfully', transaction: newTransaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// GET /api/transactions/:id - Admin-only route to get a specific transaction record
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await transactionService.getTransactionById(id);
        if (transaction) {
            res.status(200).json(transaction);
        } else {
            res.status(404).json({ message: 'Transaction Not Found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
