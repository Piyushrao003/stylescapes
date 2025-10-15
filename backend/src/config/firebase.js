// D:\stylescapes\backend\src\config\firebase.js

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { getAuth } = require('firebase-admin/auth'); // NEW: Import the Admin Auth service

// IMPORTANT: Replace this with your actual service account path or object
const serviceAccount = require('./serviceAccountKey.json'); 
// NOTE: For security, serviceAccountKey.json should be in a secure location and NOT committed to version control.

// Initialize the Firebase Admin app
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Add your databaseURL if necessary
});

const db = getFirestore(app);
const storage = getStorage(app);
// NEW: Get a reference to the Firebase Admin Auth service
const auth = getAuth(app);

// Export all services
module.exports = { app, db, storage, auth }; // ADDED auth