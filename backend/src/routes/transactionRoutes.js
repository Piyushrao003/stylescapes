// D:\stylescapes\backend\src\routes\transactionsRoutes.js

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// This is a special endpoint, typically used by a payment gateway's webhook.
// It is public so the external service can send data without authentication.
// Endpoint: POST /api/transactions/webhook
router.post('/webhook', transactionController.recordTransaction);

// Admin-only route to get a specific transaction record by ID.
// Endpoint: GET /api/transactions/:id
// This route is protected by the verifyAdmin middleware.
router.get('/:id', verifyAdmin, transactionController.getTransactionById);

module.exports = router;
