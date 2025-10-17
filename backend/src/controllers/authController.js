// D:\stylescapes\backend\src\controllers\authController.js

const authService = require('../services/authService');
const { db, auth } = require('../config/firebase');

/**
 * @description Registers a new user on the platform.
 */
exports.registerUser = async (req, res) => {
  try {
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

    // 3. Check if a profile already exists
    const existingUserSnap = await db.collection('users').doc(uid).get();
    if (existingUserSnap.exists) {
      await auth.revokeRefreshTokens(uid);
      return res.status(400).json({ message: 'User profile already exists. Please log in.' });
    }

    // 4. Create the new user profile (Initialization)
    const newUser = {
      email: email || '',
      first_name: firstName || '',
      last_name: lastName || '',
      phone_number: phoneNumber || '',
      
      addresses: [],
      
      // --- CRITICAL FIX: INITIALIZE STATUS & ACTIVITY METRICS ---
      role: 'user', // Default role
      status: 'Active', // Default status
      status_details: {
          is_blocked: false,
          block_reason: null,
          block_expiry: null,
      },
      is_online: false, // Default to offline
      last_login_at: new Date().toISOString(), // Initial login time is now
      total_online_seconds: 0, // Initialize cumulative time
      session_start_time: null, // No active session yet
      // --- END FIX ---

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Use set() with the UID as the document ID for clean linking
    await db.collection('users').doc(uid).set(newUser);

    // 5. ISSUE CUSTOM SESSION JWT
    const sessionToken = authService.generateToken(uid, newUser.role);

    res.status(201).json({ 
      message: 'User registered successfully and logged in.', 
      token: sessionToken,
      user: {
        uid: uid,
        email: email,
        role: newUser.role,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        // Include new login time in response for client side state sync
        lastLoginAt: newUser.last_login_at, 
      }
    });

  } catch (error) {
    console.error('Registration/Token verification error:', error);
    res.status(401).json({ message: 'Authentication failed. Invalid Firebase token.' });
  }
};

/**
 * @description Logs in a user by verifying their Firebase ID Token and generating a Session JWT token.
 */
exports.loginUser = async (req, res) => {
  try {
    const { token } = req.body; 
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const userSnapshot = await db.collection('users').doc(uid).get();
    
    if (!userSnapshot.exists) {
      return res.status(404).json({ message: 'User profile not found. Please re-register.' });
    }
    
    // 2.1 CRITICAL FIX: Update last_login_at in Firestore
    const newLoginTime = new Date().toISOString();

    await db.collection('users').doc(uid).update({
        last_login_at: newLoginTime,
        updated_at: newLoginTime, 
        // OPTIONAL: Ensure user is marked offline initially, or defer to client app for "online" status post-load
        is_online: false, 
        session_start_time: null,
    });
    
    // Re-fetch data to include the new last_login_at
    const updatedUserSnapshot = await db.collection('users').doc(uid).get();
    const user = { uid, ...updatedUserSnapshot.data() }; 
    
    // 3. ISSUE CUSTOM SESSION JWT 
    const sessionToken = authService.generateToken(user.uid, user.role); 
    
    res.status(200).json({ 
      message: 'Login successful.', 
      token: sessionToken, 
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        // Send back the updated last login time
        lastLoginAt: user.last_login_at, 
      }
    });

  } catch (error) {
    console.error('Login/Token verification error:', error);
    res.status(401).json({ message: 'Authentication failed. Invalid Firebase token.' });
  }
};