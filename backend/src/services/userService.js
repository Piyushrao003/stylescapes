// D:\stylescapes\backend\src\services\userService.js

// Import the Firestore database reference and FieldValue for array operations
const { db } = require('../config/firebase'); 
const { FieldValue } = require('firebase-admin/firestore');
const productService = require('./productService'); // Import the service for product lookups
const inventoryService = require('./inventoryService'); // Import Inventory Service for SKU generation

// Helper to generate a unique, short ID for addresses (e.g., 'addr-abcd')
const generateUniqueAddressId = () => {
    return 'addr-' + Math.random().toString(36).substring(2, 6);
};

// --- EXISTING PROFILE & WISHLIST FUNCTIONS ---

/**
 * @description Retrieves a user's full profile document by UID.
 */
exports.findUserById = async (uid) => {
    try {
        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();
        
        if (userSnap.exists) {
            return { 
                uid: userSnap.id, 
                ...userSnap.data(),
                cart_items: userSnap.data().cart_items || [],
                wishlist: userSnap.data().wishlist || [],
                addresses: userSnap.data().addresses || [] 
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Service Error finding user by ID:", error);
        throw new Error('Database error during user lookup.');
    }
};

/**
 * @description Updates core user profile fields (name/phone) in Firestore.
 */
exports.updateUserProfile = async (uid, updateData) => {
    try {
        const userRef = db.collection('users').doc(uid);
        const now = new Date().toISOString();
        
        const finalUpdate = {};

        if (updateData.firstName !== undefined) {
             finalUpdate.first_name = updateData.firstName;
        }
        if (updateData.lastName !== undefined) {
             finalUpdate.last_name = updateData.lastName;
        }
        if (updateData.phoneNumber !== undefined) {
             finalUpdate.phone_number = updateData.phoneNumber;
        }

        if (Object.keys(finalUpdate).length === 0) {
            throw new Error("No valid fields provided for profile update.");
        }
        
        await userRef.update({ ...finalUpdate, updated_at: now });
        
        // Return the full updated user object (in snake_case)
        const updatedSnap = await userRef.get();
        return { uid, ...updatedSnap.data() }; 

    } catch (error) {
        console.error("Error trying to fetch or call the service:", error);
        throw new Error(`Failed to update user profile: ${error.message}`);
    }
};

/**
 * @description Adds or removes a product ID from the authenticated user's wishlist array in Firestore.
 */
exports.updateWishlist = async (uid, productId, action) => {
    try {
        const userRef = db.collection('users').doc(uid);
        let updateData = {};

        if (action === 'add') {
            updateData = {
                wishlist: FieldValue.arrayUnion(productId),
                updated_at: new Date().toISOString()
            };
        } else if (action === 'remove') {
            updateData = {
                wishlist: FieldValue.arrayRemove(productId),
                updated_at: new Date().toISOString()
            };
        } else {
            throw new Error('Invalid action specified for wishlist update.');
        }

        await userRef.update(updateData);
        
        const updatedUserSnap = await userRef.get();
        return updatedUserSnap.data().wishlist || [];

    } catch (error) {
        console.error("Service Error updating wishlist:", error);
        
        if (error.code === 'not-found') {
             throw new Error(`User profile not found for UID: ${uid}`);
        }
        
        throw new Error('Failed to update user wishlist in database.');
    }
};

/**
 * @description Checks if a user has a completed/delivered order for a specific product.
 */
exports.checkUserVerifiedPurchase = async (userId, productId) => {
    try {
        const ordersSnap = await db.collection('orders')
            .where('customer_id', '==', userId)
            .where('status', '==', 'delivered') 
            .limit(10) 
            .get();

        if (ordersSnap.empty) {
            return false; 
        }

        for (const doc of ordersSnap.docs) {
            const orderItems = doc.data().order_items || [];
            const productFound = orderItems.some(item => item.product_id === productId);
            if (productFound) {
                return true; 
            }
        }

        return false;
        
    } catch (error) {
        console.error("Service Error checking verified purchase:", error);
        return false;
    }
};


// ----------------------------------------------------
// NEW: ADMIN USER MANAGEMENT FUNCTIONS
// ----------------------------------------------------

/**
 * @description Retrieves ALL user documents from Firestore (Admin only).
 */
exports.getAllUsers = async () => {
    try {
        const userSnapshot = await db.collection('users')
            .orderBy('created_at', 'desc')
            .get(); 

        const usersData = userSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));
        
        return usersData;
    } catch (error) {
        console.error("Service Error in getAllUsers:", error);
        throw new Error('Failed to retrieve all users from database.');
    }
};

/**
 * @description Updates a user's status (block/unblock) and related status details.
 */
exports.updateUserStatus = async (userId, newStatus, durationDays) => {
    const userRef = db.collection('users').doc(userId);
    const now = new Date().toISOString();
    let updatePayload = { updated_at: now, status: newStatus };
    
    try {
        if (newStatus === 'Active') {
            // Unblock: Clear all blocking details
            updatePayload.status_details = {
                is_blocked: false,
                block_reason: null,
                block_expiry: null,
            };
        } else if (newStatus === 'Permanently Blocked' || newStatus === 'Temporarily Blocked') {
            // Block: Calculate expiry date if temporary
            let expiryDate = null;
            if (newStatus === 'Temporarily Blocked' && durationDays) {
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + durationDays);
                expiryDate = expiry.toISOString();
            }
            
            updatePayload.status_details = {
                is_blocked: true,
                block_reason: newStatus,
                block_expiry: expiryDate,
            };
        }
        
        // Ensure that we don't accidentally override the role or other core fields
        await userRef.update(updatePayload);

        // Fetch and return the updated document
        const updatedSnap = await userRef.get();
        return { id: updatedSnap.id, ...updatedSnap.data() };
        
    } catch (error) {
        console.error(`Error updating user status for ${userId}:`, error);
        throw new Error('Failed to update user status in database.');
    }
};

/**
 * @description Handles setting online/offline status and accumulates total online time.
 */
exports.updateUserOnlineStatus = async (uid, isOnline) => {
    const userRef = db.collection('users').doc(uid);
    const now = new Date();
    const nowISO = now.toISOString();
    
    return await db.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        if (!userSnap.exists) {
            throw new Error('User not found.');
        }
        
        const userData = userSnap.data();
        let updateData = { updated_at: nowISO, is_online: isOnline };
        
        if (isOnline) {
            // SCENARIO 1: User goes Online/App starts - Start Timer
            updateData.session_start_time = nowISO;
            
        } else {
            // SCENARIO 2: User goes Offline/App closes - Calculate Time & Accumulate
            const sessionStartTime = userData.session_start_time;
            
            if (sessionStartTime) {
                const startTime = new Date(sessionStartTime);
                const durationMs = now.getTime() - startTime.getTime();
                
                // Cap duration to prevent malicious or accidental extreme values (e.g., max 8 hours for one session)
                const maxDurationSeconds = 8 * 60 * 60; 
                
                // Accumulate time in SECONDS
                let durationSeconds = Math.round(durationMs / 1000);
                
                // Enforce cap
                if (durationSeconds > maxDurationSeconds) {
                    durationSeconds = maxDurationSeconds; 
                }

                // Update total_online_seconds atomically and clear session start time
                updateData.total_online_seconds = FieldValue.increment(durationSeconds);
            }
            
            updateData.session_start_time = null; // Clear the temporary field
        }
        
        t.update(userRef, updateData);
        return updateData;
    });
};


// ----------------------------------------------------
// ADDRESS MANAGEMENT FUNCTIONS (Multi-Address Logic)
// ----------------------------------------------------

/**
 * @description Adds a new address to the user's array, respecting the limit (3).
 */
exports.addAddress = async (uid, addressData) => {
    const userRef = db.collection('users').doc(uid);
    const newAddressId = generateUniqueAddressId();
    const now = new Date().toISOString();

    return await db.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        const currentAddresses = userSnap.data().addresses || [];

        if (currentAddresses.length >= 3) {
            throw new Error("Address limit reached. You can only save up to 3 addresses.");
        }
        
        const isDefault = currentAddresses.length === 0;

        const newAddress = {
            id: newAddressId,
            is_default: isDefault,
            ...addressData,
            created_at: now,
        };

        currentAddresses.push(newAddress);
        
        t.update(userRef, { addresses: currentAddresses, updated_at: now });
        
        return currentAddresses;
    });
};

/**
 * @description Updates an existing address or sets a new one as default.
 */
exports.updateAddress = async (uid, addressId, updateData) => {
    const userRef = db.collection('users').doc(uid);
    const now = new Date().toISOString();

    return await db.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        let currentAddresses = userSnap.data().addresses || [];
        let addressFound = false;

        const updatedAddresses = currentAddresses.map(addr => {
            if (addr.id === addressId) {
                addressFound = true;
                
                if (updateData.is_default === true) {
                    currentAddresses = currentAddresses.map(a => ({ ...a, is_default: false }));
                    return { ...addr, ...updateData, is_default: true };
                }
                
                return { ...addr, ...updateData };
            }
            if (updateData.is_default === true) {
                 return { ...addr, is_default: false };
            }

            return addr;
        });

        if (!addressFound) {
            throw new Error(`Address ID ${addressId} not found.`);
        }
        
        t.update(userRef, { addresses: updatedAddresses, updated_at: now });
        
        return updatedAddresses;
    });
};

/**
 * @description Deletes an address by its ID. Prevents deletion of the last address.
 */
exports.deleteAddress = async (uid, addressId) => {
    const userRef = db.collection('users').doc(uid);
    const now = new Date().toISOString();

    return await db.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        let currentAddresses = userSnap.data().addresses || [];

        if (currentAddresses.length <= 1) {
             throw new Error("Cannot delete: You must keep at least one address.");
        }

        const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);
        
        if (currentAddresses.find(a => a.id === addressId)?.is_default) {
            if (updatedAddresses.length > 0) {
                 updatedAddresses[0].is_default = true;
            }
        }
        
        t.update(userRef, { addresses: updatedAddresses, updated_at: now });
        
        return updatedAddresses;
    });
};


// ----------------------------------------------------
// CART & DENORMALIZATION FUNCTIONS 
// ----------------------------------------------------

/**
 * @description Retrieves cart items and dynamically adds current product details (Hybrid Model).
 */
exports.fetchCartItems = async (uid) => {
    const user = await exports.findUserById(uid);

    if (!user) {
        throw new Error(`User profile not found for UID: ${uid}`);
    }
    
    const rawCartItems = user.cart_items || [];
    
    if (rawCartItems.length === 0) {
        return [];
    }

    // 1. Get all unique product IDs in the cart
    const productIds = [...new Set(rawCartItems.map(item => item.product_id))];

    // 2. Fetch all product details in a single batch read 
    const productDetailsMap = await productService.getProductsDetailsBatch(productIds);
    
    // 3. Combine cart data with current product details and check stock
    const fullyPopulatedCart = rawCartItems.map(item => {
        const product = productDetailsMap[item.product_id];
        
        if (!product || product.status === 'deleted') {
            return { ...item, price: 0, product_name: 'Unavailable Product', is_available: false, stock_level: 0 };
        }

        const currentPrice = product.price?.sale_price || product.price?.base_price || 0;
        const imageUrl = product.images?.image_url;
        
        // --- STOCK CHECK LOGIC ---
        const variantSku = inventoryService.generateVariantSku(item.product_id, item.selected_color, item.selected_size);
        const variantInventory = product.variant_inventory?.[variantSku];
        
        const stockLevel = variantInventory?.stock_level || 0;
        const isAvailable = stockLevel >= item.quantity; 

        return {
            ...item,
            product_name: product.product_name,
            image_url: imageUrl,
            price: currentPrice, 
            is_available: isAvailable, 
            stock_level: stockLevel 
        };
    }).filter(item => item.is_available || item.quantity > 0); 

    return fullyPopulatedCart;
};

/**
 * @description Adds a new item or updates an existing item's quantity in the cart.
 */
exports.updateCartItemInDb = async (uid, itemToSave) => {
    const userRef = db.collection('users').doc(uid);
    const { product_id, selected_color, selected_size, quantity } = itemToSave;

    const variantId = inventoryService.generateVariantSku(product_id, selected_color, selected_size);

    // --- PRE-CHECK STOCK BEFORE TRANSACTION ---
    try {
        const variantStockData = await inventoryService.getVariantStock(product_id, selected_color, selected_size);
        const currentStock = variantStockData?.stock_level ?? 0;
        
        if (currentStock < quantity) {
            throw new Error(`Insufficient stock for selected variant. Only ${currentStock} available.`);
        }
    } catch (error) {
        console.error("Error during pre-stock check:", error);
        
        if (error.message.includes('Insufficient stock')) {
            throw error;
        }
        throw new Error(`Inventory Error: Could not verify stock availability.`); 
    }

    // Use a transaction for safe read-modify-write
    await db.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        if (!userSnap.exists) {
            throw new Error('User profile not found during cart update.');
        }

        const userData = userSnap.data();
        let currentCart = userData.cart_items || [];
        
        // Check if an item with this specific variant already exists
        const existingItemIndex = currentCart.findIndex(item => 
            item.product_id === product_id &&
            item.selected_color === selected_color &&
            item.selected_size === selected_size
        );

        if (existingItemIndex > -1) {
            // UPDATE existing item quantity
            currentCart[existingItemIndex].quantity = quantity;
            currentCart[existingItemIndex].added_at = new Date().toISOString();
        } else {
            // ADD new item
            const newItem = {
                id: variantId, 
                product_id: product_id,
                selected_color: selected_color,
                selected_size: selected_size,
                quantity: quantity,
                added_at: new Date().toISOString(),
            };
            currentCart.push(newItem);
        }

        // Write the entire updated cart array back
        t.update(userRef, { cart_items: currentCart, updated_at: new Date().toISOString() });
    });

    // Re-fetch the cart after successful transaction for accurate response
    return exports.fetchCartItems(uid);
};

/**
 * @description Removes a specific line item from the cart based on its generated ID.
 */
exports.removeCartItemFromDb = async (uid, itemId) => {
    const userRef = db.collection('users').doc(uid);
    
    await db.runTransaction(async (t) => {
        const userSnap = await t.get(userRef);
        if (!userSnap.exists) {
            throw new Error('User profile not found during item removal.');
        }
        
        const userData = userSnap.data();
        let currentCart = userData.cart_items || [];
        
        const initialLength = currentCart.length;
        
        // Filter out the item matching the unique ID
        const updatedCart = currentCart.filter(item => item.id !== itemId);
        
        if (updatedCart.length === initialLength) {
             console.warn(`Attempted to remove item ${itemId} from cart.`);
        }

        t.update(userRef, { cart_items: updatedCart, updated_at: new Date().toISOString() });
    });

    return exports.fetchCartItems(uid);
};


/**
 * @description Clears the entire cart array.
 */
exports.clearCartInDb = async (uid) => {
    const userRef = db.collection('users').doc(uid);
    await userRef.update({ 
        cart_items: [],
        updated_at: new Date().toISOString()
    });
};