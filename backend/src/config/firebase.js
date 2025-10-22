// D:\stylescapes\backend\src\config\firebase.js

const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
// Optional field, defaults to empty string if not set
const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID || ''; 

// --- Validation ---
if (!privateKeyRaw || !clientEmail || !projectId || !storageBucket) {
    console.error("CRITICAL ERROR: One or more Firebase Admin SDK environment variables are missing (Key, Email, Project ID, or Storage Bucket).");
    process.exit(1);
}

let serviceAccount;

try {
    // 1. Trim the key and replace escaped newlines (\\n) with literal newlines (\n).
    // This is necessary to correctly format the certificate block from the .env file.
    const trimmedKey = privateKeyRaw.trim();
    const privateKeyFormatted = trimmedKey.replace(/\\n/g, '\n'); 

    // 2. Reconstruct the Service Account Object
    serviceAccount = {
        "type": "service_account", 
        "project_id": projectId,
        "private_key_id": privateKeyId,
        "private_key": privateKeyFormatted, 
        "client_email": clientEmail,
    };
    
} catch (e) {
    console.error("CRITICAL ERROR: Failed to reconstruct or parse service account JSON.", e.message);
    process.exit(1);
}


// --- Initialize Firebase Admin SDK ---
try {
    const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Use the storage bucket URL, required for file operations
        storageBucket: storageBucket 
    });
    
    // 4. Export References
    const db = admin.firestore(app);
    const auth = admin.auth(app);
    
    module.exports = { app, db, auth };

} catch (e) {
    console.error("CRITICAL ERROR: Firebase SDK initialization failed. Check your project ID and storage bucket settings.", e.message);
    process.exit(1);
}