// D:\stylescapes\backend\src\controllers\authController.js

const authService = require('../services/authService');
const { db, auth } = require('../config/firebase'); // UPDATED: Added auth

/**
 * @description Registers a new user on the platform.
 * It expects a Firebase ID Token, verifies it, saves user details to Firestore, and issues a Session JWT.
 */
exports.registerUser = async (req, res) => {
  try {
    // 1. Expected payload now includes the secure Firebase ID Token
    const { 
      token, 
      firstName, 
      lastName, 
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode
    } = req.body;

    // 2. VERIFY FIREBASE ID TOKEN (Authentication)
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // 3. Check if a profile already exists in our Firestore DB using the secure UID
    const existingUserSnap = await db.collection('users').doc(uid).get();
    if (existingUserSnap.exists) {
      // If user exists, revoke the token to force relogin or handle as a profile update
      await auth.revokeRefreshTokens(uid);
      return res.status(400).json({ message: 'User profile already exists. Please log in.' });
    }

    // 4. Create the new user profile (Authorization/Profile)
    const newUser = {
      email: email || '',
      first_name: firstName || '',
      last_name: lastName || '',
      phone_number: phoneNumber || '',
      address: {
        address_line_1: addressLine1 || '',
        address_line_2: addressLine2 || '',
        city: city || '',
        state: state || '',
        zip_code: zipCode || ''
      },
      role: 'user', // Default role
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Use set() with the UID as the document ID for clean linking
    await db.collection('users').doc(uid).set(newUser);

    // 5. ISSUE CUSTOM SESSION JWT (Session Key)
    const sessionToken = authService.generateToken(uid, newUser.role);

    res.status(201).json({ 
      message: 'User registered successfully and logged in.', 
      token: sessionToken, // Send back the custom, long-lived Session JWT
      user: {
        uid: uid,
        email: email,
        role: newUser.role,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
      }
    });

  } catch (error) {
    console.error('Registration/Token verification error:', error);
    // If verifyIdToken fails, it's usually 401
    res.status(401).json({ message: 'Authentication failed. Invalid Firebase token.' });
  }
};

/**
 * @description Logs in a user by verifying their Firebase ID Token and generating a Session JWT token.
 */
exports.loginUser = async (req, res) => {
  try {
    const { token } = req.body; // Expected payload now is the Firebase ID Token

    // 1. VERIFY FIREBASE ID TOKEN (Authentication)
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // 2. Retrieve user profile data from Firestore (Authorization/Profile)
    const userSnapshot = await db.collection('users').doc(uid).get();
    
    if (!userSnapshot.exists) {
      // User is authenticated via Firebase but profile is missing (registration error)
      return res.status(404).json({ message: 'User profile not found. Please re-register.' });
    }
    
    const user = { uid, ...userSnapshot.data() };
    
    // 3. ISSUE CUSTOM SESSION JWT (Session Key)
    const sessionToken = authService.generateToken(user.uid, user.role); 
    
    res.status(200).json({ 
      message: 'Login successful.', 
      token: sessionToken, // Send back the custom, long-lived Session JWT
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      }
    });

  } catch (error) {
    console.error('Login/Token verification error:', error);
    // If verifyIdToken fails, it's usually 401
    res.status(401).json({ message: 'Authentication failed. Invalid Firebase token.' });
  }
};