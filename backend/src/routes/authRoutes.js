// D:\stylescapes\backend\src\routes\authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to handle new user registration
// Endpoint: POST /api/auth/register
// This route is public and does not require authentication.
router.post('/register', authController.registerUser);

// Route to handle user login
// Endpoint: POST /api/auth/login
// This route is public and does not require authentication.
router.post('/login', authController.loginUser);

module.exports = router;