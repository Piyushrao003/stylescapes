// D:\stylescapes\backend\src\services\orderService.js

const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const inventoryService = require('./inventoryService'); 
const userService = require('./userService'); 
const productService = require('./productService'); 

// --- 1. UNIQUE ORDER ID GENERATION HELPER ---

/**
 * @description Generates a random 4-digit hex string (XXXX).
 * @returns {string} 4-character hex string.
 */
const generateRandomHex = () => {
    return Math.floor(Math.random() * 0x10000).toString(16).toUpperCase().padStart(4, '0');
};

/**
 * @description Generates a date code (YMMD).
 * @returns {string} 4-character date string (e.g., 5101).
 */
const generateDateCode = () => {
    const now = new Date();
    const yearDigit = String(now.getFullYear()).slice(-1);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0'); 
    return `${yearDigit}${month}${day.slice(-1)}`; 
};

/**
 * @description Generates a unique, collision-safe Order ID in STYL-YMMD-XXXX format.
 * @returns {Promise<string>} The unique order ID.
 */
const generateUniqueOrderId = async () => {
    const prefix = 'STYL';
    const dateCode = generateDateCode();
    
    let isUnique = false;
    let orderId = '';
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
        const hexSuffix = generateRandomHex();
        orderId = `${prefix}-${dateCode}-${hexSuffix}`;
        
        const docRef = db.collection('orders').doc(orderId);
        const docSnap = await docRef.get(); 
        
        if (!docSnap.exists) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Critical Error: Failed to generate a unique Order ID after multiple attempts.');
    }
    
    return orderId;
};


// --- 2. ADDRESS LOOKUP HELPER (New Multi-Address Logic) ---

/**
 * @description Locates the specified or default address from the user's addresses array.
 * @param {object} user - The user object containing the 'addresses' array.
 * @param {string} [addressId] - The ID of the address to locate (optional).
 * @returns {object} The selected address object.
 */
const getShippingAddress = (user, addressId) => {
    const addresses = user.addresses || [];
    
    if (addresses.length === 0) {
        throw new Error("No saved addresses found. Please add a shipping address.");
    }
    
    let selectedAddress = null;

    if (addressId) {
        selectedAddress = addresses.find(addr => addr.id === addressId);
    }
    
    // Fallback: Use the default address if ID is missing or not found
    if (!selectedAddress) {
        selectedAddress = addresses.find(addr => addr.is_default === true);
    }
    
    // Final fallback to the first address if no default is set
    if (!selectedAddress) {
        selectedAddress = addresses[0];
    }
    
    if (!selectedAddress) {
        throw new Error("A valid default shipping address could not be determined.");
    }

    return selectedAddress;
};


// --- 3. CORE ORDER CREATION LOGIC (Updated for Dual Flow and Multi-Address) ---

exports.createOrder = async (customerId, orderData) => {
    
    const isDirectCheckout = !!orderData.direct_item;
    let orderItemsToProcess = [];
    
    try {
        // Fetch the entire user profile to access the addresses array
        const user = await userService.findUserById(customerId);
        if (!user) {
            throw new Error('User profile not found.');
        }

        // --- STEP 1: VALIDATE AND FETCH ORDER ITEMS ---
        if (!isDirectCheckout) {
            // STANDARD CART CHECKOUT
            const cartItems = await userService.fetchCartItems(customerId);
            
            const availableCartItems = cartItems.filter(item => item.is_available);

            if (cartItems.length === 0) {
                 throw new Error("Missing cart items: Cannot create an order from an empty cart.");
            }
            if (availableCartItems.length !== cartItems.length) {
                 throw new Error("Inventory Error: One or more cart items are now out of stock. Please refresh your cart.");
            }
            
            orderItemsToProcess = availableCartItems.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                price_at_purchase: item.price, 
                selected_size: item.selected_size,
                selected_color: item.selected_color,
            }));
            
        } else {
            // DIRECT BUY NOW CHECKOUT
            const item = orderData.direct_item;
            
            if (!item.product_id || !item.selected_color || !item.selected_size || !item.quantity || item.quantity < 1) {
                 throw new Error("Invalid item details provided for direct checkout.");
            }
            
            const product = await productService.getProductDetails(item.product_id); 
            if (!product) { throw new Error("Product not found or unavailable for purchase."); }
            
            const priceAtPurchase = product.price?.sale_price || product.price?.base_price || 0;
            
            const variantSku = inventoryService.generateVariantSku(item.product_id, item.selected_color, item.selected_size);
            const variantStockData = product.variant_inventory?.[variantSku];
            const currentStock = variantStockData?.stock_level || 0;
            
            if (currentStock < item.quantity) {
                 throw new Error(`Insufficient stock for product variant. Only ${currentStock} available.`);
            }

            orderItemsToProcess.push({
                product_id: item.product_id,
                product_name: product.product_name,
                quantity: item.quantity,
                price_at_purchase: priceAtPurchase, 
                selected_size: item.selected_size,
                selected_color: item.selected_color,
            });
        }
        
        // --- STEP 2: ADDRESS LOOKUP ---
        // Address ID is optionally sent in orderData.shippingAddressId from frontend checkout
        const finalShippingAddress = getShippingAddress(user, orderData.shippingAddressId);


        // --- STEP 3: ATOMIC STOCK DEDUCTION ---
        await inventoryService.decrementStock(orderItemsToProcess);


        // --- STEP 4: GENERATE UNIQUE ORDER ID & CREATE ORDER DOCUMENT ---
        const finalOrderId = await generateUniqueOrderId();
        
        const orderToSave = {
            ...orderData,
            customer_id: customerId,
            order_items: orderItemsToProcess, 
            order_date: new Date().toISOString(),
            status: 'pending',
            
            // CRITICAL: Save the full, final shipping address object
            shipping_address_snapshot: finalShippingAddress, 

            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const docRef = db.collection('orders').doc(finalOrderId);
        await docRef.set(orderToSave);

        // --- STEP 5: CLEAN UP (Only for Standard Checkout) ---
        if (!isDirectCheckout) {
             await userService.clearCartInDb(customerId);
        }
        
        return { order_id: finalOrderId, ...orderToSave };
        
    } catch (error) {
        console.error("Error in createOrder (Dual Flow):", error);
        throw error;
    }
};


// ----------------------------------------------------
// 4. EXISTING FUNCTION EXPORTS (Complete Original Logic)
// ----------------------------------------------------

/**
 * @description GET all orders (Admin only).
 */
exports.getAllOrders = async () => {
    try {
        const ordersCollectionRef = db.collection('orders');
        const ordersQuerySnapshot = await ordersCollectionRef.get();
        const orders = ordersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return orders;
    } catch (error) {
        console.error("Error in getAllOrders:", error);
        throw new Error('Failed to retrieve all orders.');
    }
};

/**
 * @description PUT update order status (Admin only).
 */
exports.updateOrderStatus = async (orderId, newStatus) => {
    try {
        const orderRef = db.collection('orders').doc(orderId);
        await orderRef.update({ status: newStatus, updated_at: new Date().toISOString() });
    } catch (error) {
        console.error("Error in updateOrderStatus:", error);
        throw new Error('Failed to update order status.');
    }
};

/**
 * @description GET orders by user ID.
 */
exports.getOrdersByUser = async (customerId) => {
    try {
        const ordersQuerySnapshot = await db.collection('orders').where('customer_id', '==', customerId).get();
        const orders = ordersQuerySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return orders;
    } catch (error) {
        console.error("Error in getOrdersByUser:", error);
        throw new Error('Failed to retrieve user orders.');
    }
};