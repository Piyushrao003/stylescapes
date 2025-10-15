// D:\stylescapes\backend\src\services\authService.js

const { db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
// REMOVED: const bcrypt = require('bcrypt'); // No longer needed

/**
 * @description Finds a user document by email in Firestore.
 * NOTE: This is for retrieving user profile data, not for password verification anymore.
 * This is primarily used for utility outside of the new login/register flow.
 * @param {string} email - The user's email.
 * @returns {Promise<object|null>} The user document data or null.
 */
exports.findUserByEmail = async (email) => {
    try {
        // Find the user document where the 'email' field matches
        const userQuerySnapshot = await db.collection('users').where('email', '==', email).get();
        
        if (userQuerySnapshot.empty) {
            return null;
        }
        
        const userData = userQuerySnapshot.docs[0].data();
        return { 
            uid: userQuerySnapshot.docs[0].id,
            ...userData
        };
    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
};

// REMOVED: exports.hashPassword = async (plainTextPassword) => { ... }
// REMOVED: exports.verifyPassword = async (plainTextPassword, hashedPassword) => { ... }


/**
 * @description Generates a secure JWT token for a user session.
 * This is the Custom Session JWT used for fast, local authorization checks.
 * @param {string} uid - The user's unique ID.
 * @param {string} role - The user's role.
 * @returns {string} The JWT token.
 */
exports.generateToken = (uid, role) => {
    const payload = { uid, role };
    const secret = process.env.JWT_SECRET;
    return jwt.sign(payload, secret, {
        expiresIn: '1h', // Session length
        algorithm: 'HS256',
    });
};