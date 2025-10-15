// D:\stylescapes\backend\src\config\storage.js

// This file handles all interactions with Firebase Storage for file management.

// Import the Firebase Admin SDK and necessary services
const { bucket } = require('firebase-admin/storage');
const { app } = require('./firebase'); // We are still importing the app instance

// Get a reference to the Firebase Storage service
const storage = app.storage();

/**
 * @description Uploads a file to Firebase Storage and returns its public URL.
 * @param {object} file - The file object from the request.
 * @param {string} filePath - The path where the file will be stored (e.g., 'products/product-id/image.jpg').
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
exports.uploadFile = async (file, filePath) => {
  const fileRef = storage.bucket().file(filePath);

  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  });

  const url = await fileRef.getSignedUrl({
    action: 'read',
    expires: '03-09-2491', // A long-lasting expiration date
  });

  return url[0];
};

/**
 * @description Deletes a file from Firebase Storage.
 * @param {string} filePath - The path to the file in Storage (e.g., 'products/product-id/image.jpg').
 * @returns {Promise<void>}
 */
exports.deleteFile = async (filePath) => {
  const fileRef = storage.bucket().file(filePath);
  await fileRef.delete();
};