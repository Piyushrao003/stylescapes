// D:\stylescapes\backend\src\routes\policiesRoutes.js

// Imports the Express router module 
const express = require('express');
const router = express.Router();

// Imports controller and middleware
const policyController = require('../controllers/policyController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// --- READ POLICY (PUBLIC ACCESS) ---
// Endpoint: GET /api/policies/:id
// Example: /api/policies/terms
router.get('/:id', policyController.getPolicy);

// --- UPDATE POLICY (ADMIN-ONLY ACCESS) ---
// Endpoint: PUT /api/policies/:id
// Access Control: verifyAdmin ensures only authenticated admin can update this critical content.
router.put('/:id', verifyAdmin, policyController.updatePolicy);

module.exports = router;