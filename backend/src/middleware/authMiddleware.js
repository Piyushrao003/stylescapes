// D:\stylescapes\backend\src\middleware\authMiddleware.js

const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase'); // Firestore is needed only for verifyAdmin's role lookup

// Middleware to verify if the authenticated user has an 'admin' role.
// This now verifies the CUSTOM SESSION JWT and checks the role in Firestore.
exports.verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication failed. No token provided.' });
  }

  const tokenValue = token.split(' ')[1];

  try {
    // 1. Verify the CUSTOM SESSION JWT locally (FAST CHECK)
    const decodedToken = jwt.verify(tokenValue, process.env.JWT_SECRET);
    const userId = decodedToken.uid; // Get UID from the custom token

    if (!userId) {
      return res.status(403).json({ message: 'Access denied. Invalid token payload.' });
    }

    // 2. Get the user's document from Firestore to confirm current role (Authorization)
    const userSnapshot = await db.collection('users').doc(userId).get();

    if (userSnapshot.exists && userSnapshot.data().role === 'admin') {
      // Attach the user's details for downstream controllers
      req.user = { uid: userId, role: userSnapshot.data().role };
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
  } catch (error) {
    // Handles JWT errors (expired, invalid signature)
    console.error("Authorization error:", error);
    return res.status(401).json({ message: 'Authentication failed. Invalid or expired session token.' });
  }
};

// This middleware verifies a user's token for general protected routes.
// This now verifies the CUSTOM SESSION JWT.
exports.verifyUser = (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed. Please log in.' });
    }
  
    const tokenValue = token.split(' ')[1];

    try {
      // 1. Verify the CUSTOM SESSION JWT locally (FAST CHECK)
      const decodedToken = jwt.verify(tokenValue, process.env.JWT_SECRET);
      
      // Attach the user's UID for use in controllers (e.g., in orderController.js)
      req.user = { uid: decodedToken.uid }; 
      next();
    } catch (error) {
      // Handles JWT errors (expired, invalid signature)
      return res.status(401).json({ message: 'Authentication failed. Invalid or expired session token.' });
    }
};