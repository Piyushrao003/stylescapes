import React, { useState, useEffect, useRef } from 'react';
// Updated CSS Import Path
import '../../styles/admin/ProductManagement.css'; 
// API Imports
import { createProduct, updateProduct, deleteProduct, getProductById, getProducts } from '../../api/productsApi';


// --- CONSTANTS (FIXED: Declared here to resolve compilation error) ---
const MAX_UPLOAD_SIZE = 400 * 1024; // 400KB
const MIN_FILES = 3;
const MAX_FILES = 5;

const initialProducts = []; 
const initialCategories = ['Shirt', 'Pant', 'T-shirt', 'Kurta', 'Jacket']; 
// --- END CONSTANTS ---


// --- SVG ICON LIBRARY (Simplified) ---
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const TagsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.828 2.217a1 1 0 0 1 1.414 0l9 9a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-1.414 0l-9-9a1 1 0 0 1 0-1.414l9-9z"/><circle cx="15" cy="9" r="2"/></svg>
);
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
);


// Function to calculate GST rate based on discounted price
const calculateGST = (discountedPrice) => {
    if (discountedPrice <= 1500) {
        return 5;
    } else if (discountedPrice > 1500 && discountedPrice <= 10000) {
        return 12;
    } else { // price > 10000
        return 18;
    }
};

const initialFormState = {
    id: null,
    name: '',
    sku: '',
    description: '',
    material: '',
    color: '',
    sizes: '',
    category: '',
    price: 0,
    discount: 0,
    discountType: 'percentage',
    stock: 0, // Obsolete for multi-variant, but used for single initial entry
    shippingCharges: { 'Inside 1000km': 50, '1000-2000km': 100, '2k-3k': 150 },
    shippingTime: { 'Inside 1000km': 3, '1000-2000km': 5, '2k-3k': 7 },
    images: [], 
    // NEW: Data structure to hold current variant stock for editing in the modal
    variantStockData: {}, 
};


const ProductManagement = () => {
    // --- State Hooks ---
    const [products, setProducts] = useState(initialProducts); // FIX
    const [categories, setCategories] = useState(initialCategories); // FIX
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState(null);
    const [productForm, setProductForm] = useState(initialFormState);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [imageUploadStatus, setImageUploadStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null); 
    const token = localStorage.getItem('token');

    // --- Data Fetching (Initial Load and Global Sync) ---
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await getProducts(token);
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            setImageUploadStatus('Error: Failed to load products. Check console/backend.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProducts();
    }, [token]);


    // --- Price Calculation Logic ---
    const calculateDiscountedPrice = () => {
        const value = productForm.discount || 0;
        const base = productForm.price || 0;

        if (productForm.discountType === 'flat_rate') {
            return Math.max(0, base - value);
        } else {
            const finalPrice = base * (1 - value / 100);
            return Math.max(0, finalPrice);
        }
    };
    
    const discountedTotal = calculateDiscountedPrice();
    const calculatedGST_Rate = calculateGST(discountedTotal);

    // --- Effects (Calculations for display) ---
    useEffect(() => {
        const discountedTotalCalc = calculateDiscountedPrice();
        const calculatedGST_Rate_Effect = calculateGST(discountedTotalCalc);
        const finalPriceCalc = discountedTotalCalc + (discountedTotalCalc * (calculatedGST_Rate_Effect / 100));
        
        // Update display fields using side-effects
        const discountedInput = document.getElementById('adp-product-discounted-total');
        const finalPriceInput = document.getElementById('adp-product-final-price');
        const gstInput = document.getElementById('adp-product-gst-display');

        if (discountedInput) {
            discountedInput.value = discountedTotalCalc.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
        }
        if (finalPriceInput) {
            finalPriceInput.value = finalPriceCalc.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
        }
        if (gstInput) {
            gstInput.value = `${calculatedGST_Rate_Effect}% (Auto)`;
        }

    }, [productForm.price, productForm.discount, productForm.discountType]);

    // --- Image Validation & Incremental Store ---
    const validateImageFiles = (fileList) => {
        const files = Array.from(fileList);
        const failedFiles = []; 
        
        // 1. Size Validation
        for (const file of files) {
            if (file.size > MAX_UPLOAD_SIZE) {
                const fileSizeKB = (file.size / 1024).toFixed(1);
                failedFiles.push(`${file.name} (${fileSizeKB}KB)`);
            }
        }
        
        if (failedFiles.length > 0) {
            const statusMessage = `Error: ${failedFiles.length} file(s) exceed the 400KB limit. Invalid files: ${failedFiles.join(', ')}.`;
            setImageUploadStatus(statusMessage);
            return { isValid: false, files: [] };
        }
        
        return { isValid: true, files: files };
    };

    // --- Generic Handlers ---
    const handleFormChange = (e) => {
        const { id, value, type, files } = e.target;
        const stateId = id.replace('adp-product-', '');

        // --- HANDLES IMAGES (Incremental Upload Fix) ---
        if (id === 'adp-product-images') {
            const newFiles = e.target.files;
            if (!newFiles || newFiles.length === 0) return;
            
            const { isValid, files: validatedFiles } = validateImageFiles(newFiles);
            
            if (isValid) {
                const currentFiles = productForm.images || [];
                const combinedFiles = [...currentFiles, ...validatedFiles];

                if (combinedFiles.length > MAX_FILES) {
                     setImageUploadStatus(`Error: Total files cannot exceed ${MAX_FILES}. Please remove old ones.`);
                     return;
                }
                
                setProductForm(prev => ({ ...prev, images: combinedFiles })); 
                
                // Update status for the successful incremental upload
                const requiredCount = MIN_FILES - combinedFiles.length;
                if (requiredCount > 0) {
                    setImageUploadStatus(`Success. Need ${requiredCount} more file(s) (Total ${combinedFiles.length}/${MAX_FILES}).`);
                } else {
                    setImageUploadStatus(`Validation passed. Total ${combinedFiles.length} file(s) ready.`);
                }
            }
            // Clear the file input value so the same file can be selected again
            e.target.value = null; 
            return;
        } 
        // --- END IMAGE HANDLING ---

        // Handle shipping/discount type/stock changes
        if (id.startsWith('adp-shipping-charges-') || id.startsWith('adp-shipping-time-')) {
            const zone = id.split('-').pop(); 
            const field = id.includes('charges') ? 'shippingCharges' : 'shippingTime';
            
            // FIX: Accepts empty string as 0
            const numValue = value === '' ? 0 : parseFloat(value); 

            setProductForm(prev => ({
                ...prev,
                [field]: { ...prev[field], [zone]: numValue || 0 }
            }));
        } else if (stateId === 'discountType') {
            setProductForm(prev => ({ ...prev, discountType: value }));
        } else {
            // FIX: Corrected the malformed ternary operator on numerical fields
            let updatedValue;
            if (stateId === 'price' || stateId === 'discount' || stateId === 'stock') {
                 updatedValue = (value === '') ? 0 : parseFloat(value);
            } else {
                 updatedValue = value;
            }

            setProductForm(prev => ({ ...prev, [stateId]: updatedValue }));
        }
    };
    
    // --- Image Control Helper (For UI) ---
    const handleManualImageAdd = (e) => {
        e.preventDefault();
        fileInputRef.current.click();
    }
    
    const handleRemoveImage = (index) => {
        const updatedImages = productForm.images.filter((_, i) => i !== index);
        setProductForm(prev => ({ ...prev, images: updatedImages }));

        // Re-run validation status after removal
        const requiredCount = MIN_FILES - updatedImages.length;
        if (requiredCount > 0) {
            setImageUploadStatus(`Removed file. Need ${requiredCount} more file(s) (Total ${updatedImages.length}/${MAX_FILES}).`);
        } else {
            setImageUploadStatus(`Validation passed. Total ${updatedImages.length} file(s) ready.`);
        }
    }


    // --- Product Management Logic ---
    const handleAddProduct = () => {
        setProductForm({...initialFormState, images: []});
        setImageUploadStatus('');
        setIsProductModalOpen(true);
    };

    const handleEditProduct = (id) => {
        const product = products.find(p => p.id === id);
        if (product) {
            setProductForm({
                id: product.id,
                name: product.product_name || '',
                sku: product.sku || '',
                description: product.description || '',
                material: product.material || '',
                color: product.available_colors?.[0]?.name || '',
                sizes: product.available_sizes?.join(', ') || '',
                category: product.category || '',
                price: product.price?.base_price || 0,
                // Assume the backend sends back discount_value and discount_type if available
                discount: product.price?.discount_value || 0, 
                discountType: product.price?.discount_type || 'percentage',
                stock: product.total_stock_level || 0,
                shippingCharges: product.shipping_details?.charges || initialFormState.shippingCharges, // Retrieve saved details
                shippingTime: product.shipping_details?.time || initialFormState.shippingTime, // Retrieve saved details
                images: [], 
                variantStockData: product.variant_inventory || {}, // Load existing stock map for variant editing
            });
            setImageUploadStatus('Image fields are reset on edit. Please re-upload if needed.');
            setIsProductModalOpen(true);
        }
    };

    const handleDeleteClick = (id) => {
        setProductToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsLoading(true);
        try {
            await deleteProduct(productToDeleteId, token);
            setProducts(products.filter(p => p.id !== productToDeleteId));
            setImageUploadStatus(`Product ${productToDeleteId} deleted successfully.`);
        } catch (error) {
            setImageUploadStatus(`Error deleting product: ${error.message}`);
        } finally {
            setIsDeleteModalOpen(false);
            setProductToDeleteId(null);
            setIsLoading(false);
        }
    };

    const handleProductFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. Final Validation Check (Count/Size)
        const finalImages = productForm.images || [];
        if (!productForm.id && finalImages.length < MIN_FILES) {
             setImageUploadStatus(`Error: A minimum of ${MIN_FILES} images are required for a new product.`);
             setIsLoading(false);
             return;
        }
        
        // 2. CRITICAL: Construct the `initial_stock_variants` array
        // NOTE: For editing, the payload structure should be different, but for simplicity, 
        // we send the initial structure on create, and expect the update API to handle inventory changes separately.
        const initialStockVariants = [
            { 
                color: productForm.color || 'Default', 
                size: productForm.sizes.split(',')[0].trim() || 'One Size', 
                stock_level: productForm.stock || 0 
            }
        ];
        
        // 3. Construct Payload
        const productPayload = {
            product_name: productForm.name,
            sku: productForm.sku,
            description: productForm.description,
            category: productForm.category,
            price: {
                base_price: productForm.price,
                discount_value: productForm.discount, 
                discount_type: productForm.discountType,
                sale_price: discountedTotal,
                is_on_sale: productForm.discount > 0,
            },
            // Note: Image processing would occur here before creating URLs
            images: {
                image_url: finalImages[0]?.name || "placeholder_main_image_url", 
                additional_images: finalImages.slice(1).map(f => f.name || "placeholder_img")
            },
            
            initial_stock_variants: initialStockVariants, 
            available_colors: [{ name: productForm.color || 'Default', hex_code: '#000000' }],
            available_sizes: productForm.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0),
            
            // FIX: Including Shipping Details in the payload
            shipping_details: {
                charges: productForm.shippingCharges,
                time: productForm.shippingTime
            },
            
            // NEW: If editing, include the full variant stock map for backend update logic
            variant_inventory: productForm.variantStockData, 
        };
        
        try {
            if (productForm.id) {
                 await updateProduct(productForm.id, productPayload, token);
                 setImageUploadStatus(`Product ${productForm.id} updated successfully.`);
            } else {
                 await createProduct(productPayload, token);
                 setImageUploadStatus(`Product created successfully.`);
            }
            
            setTimeout(() => {
                setIsProductModalOpen(false);
                setProductForm(initialFormState);
                fetchProducts();
            }, 1000);

        } catch (error) {
            console.error("Product Submission Failed:", error);
            const errorMessage = error.response?.data?.message || error.message || 'Server error during submission.';
            setImageUploadStatus(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };


    // --- Category Management Logic (Unchanged) ---
    const handleAddCategory = (e) => {
        e.preventDefault();
        const newCat = newCategoryName.trim();
        if (newCat && !categories.map(c => c.toLowerCase()).includes(newCat.toLowerCase())) {
            setCategories([...categories, newCat]);
            setNewCategoryName('');
        } else if (newCat) {
            alert('Category already exists.');
        }
    };

    const handleRemoveCategory = (categoryName) => {
        const isUsed = products.some(p => p.category === categoryName);
        if (isUsed) {
            if (!window.confirm(`Warning: Category "${categoryName}" is currently used by existing products. Removing it may break product listings. Proceed?`)) {
                return;
            }
        }
        setCategories(categories.filter(c => c !== categoryName));
    };

    // --- Render Helpers (JSX) ---
    const renderProductTableRows = () => {
        if (products.length === 0) {
            return (
                <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--adp-secondary-text)' }}>
                        {isLoading ? 'Loading...' : 'No products found. Use the "Add Product" button to begin.'}
                    </td>
                </tr>
            );
        }

        return products.map(product => {
            const stockLevel = product.total_stock_level || 0; 
            const stockClass = stockLevel > 0 ? "adp-in-stock" : "adp-out-of-stock";
            const stockText = stockLevel > 0 ? `In Stock (${stockLevel})` : "Out of Stock";
            return (
                <tr key={product.id}>
                    <td><img src={product.images?.image_url} alt={product.product_name} className="adp-product-image" /></td>
                    <td>{product.product_name}</td>
                    <td>{product.category}</td>
                    <td>₹{(product.price?.base_price || 0).toLocaleString("en-IN")}</td>
                    <td><span className={`adp-stock-status ${stockClass}`}>{stockText}</span></td>
                    <td className="adp-actions-cell">
                        <button className="adp-action-btn adp-edit-btn" onClick={() => handleEditProduct(product.id)} disabled={isLoading}>
                            <EditIcon />
                        </button>
                        <button className="adp-action-btn adp-delete-btn" onClick={() => handleDeleteClick(product.id)} disabled={isLoading}>
                            <TrashIcon />
                        </button>
                    </td>
                </tr>
            );
        });
    };

    const renderCategoryOptions = () => {
        return categories.map(category => (
            <option key={category} value={category}>{category}</option>
        ));
    };

    const renderExistingCategoryList = () => {
        return categories.map(category => (
            <li key={category}>
                {category}
                <button className="adp-remove-btn" onClick={() => handleRemoveCategory(category)} disabled={isLoading}>
                    <TrashIcon />
                </button>
            </li>
        ));
    };


    // --- Main Render ---
    return (
        <div className="adp-main-wrapper">
            <main className="adp-main-content" id="adp-main-content">
                <div className="adp-products-header">
                    <h2>Product Management</h2>
                    <div className="adp-header-actions">
                        <button className="adp-add-product-btn" onClick={handleAddProduct} disabled={isLoading}>
                            <PlusIcon /> Add Product
                        </button>
                        <button className="adp-manage-category-btn" onClick={() => setIsCategoryModalOpen(true)} disabled={isLoading}>
                            <TagsIcon /> Manage Categories
                        </button>
                    </div>
                </div>

                <div className="adp-product-table-container">
                    <table className="adp-product-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="adp-product-list">
                            {renderProductTableRows()}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal for Adding/Editing Products */}
            <div className={`adp-modal ${isProductModalOpen ? 'adp-show' : ''}`} id="adp-product-modal">
                <div className="adp-modal-content">
                    <div className="adp-modal-header">
                        <h3 id="adp-modal-title">{productForm.id ? 'Edit Product' : 'Add New Product'}</h3>
                        <button className="adp-close-btn" onClick={() => setIsProductModalOpen(false)}>&times;</button>
                    </div>
                    <div className="adp-modal-body">
                        <form onSubmit={handleProductFormSubmit}>
                            <input type="hidden" id="adp-product-id" value={productForm.id || ''} />
                            
                            {/* Basic Details */}
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-name">Name</label>
                                <input type="text" id="adp-product-name" value={productForm.name} onChange={handleFormChange} required />
                            </div>
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-sku">Product SKU</label>
                                <input type="text" id="adp-product-sku" value={productForm.sku} onChange={handleFormChange} required />
                            </div>
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-description">Description</label>
                                <textarea id="adp-product-description" rows="3" value={productForm.description} onChange={handleFormChange} required></textarea>
                            </div>
                            
                            {/* Variant Fields */}
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-material">Material/Fabric</label>
                                <input type="text" id="adp-product-material" placeholder="e.g., Cotton, Denim, Silk" value={productForm.material} onChange={handleFormChange} />
                            </div>
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-color">Default Color/Variant</label>
                                <input type="text" id="adp-product-color" placeholder="e.g., Navy Blue, Maroon" value={productForm.color} onChange={handleFormChange} />
                            </div>
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-sizes">Available Sizes (Comma Separated, e.g., S, M, L, XL)</label>
                                <input type="text" id="adp-product-sizes" placeholder="S, M, L" value={productForm.sizes} onChange={handleFormChange} />
                            </div>

                            {/* Category */}
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-category">Category</label>
                                <select id="adp-product-category" value={productForm.category} onChange={handleFormChange} required>
                                    <option value="">Select a category</option>
                                    {renderCategoryOptions()}
                                </select>
                            </div>
                            
                            {/* Pricing */}
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-price">Price (₹)</label>
                                <input type="number" id="adp-product-price" min="0" value={productForm.price === 0 ? '' : productForm.price} onChange={handleFormChange} />
                            </div>
                            
                            <div className="adp-shipping-details-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                {/* Discount Type Selector */}
                                <div className="adp-form-group">
                                    <label htmlFor="adp-product-discountType">Discount Type</label>
                                    <select id="adp-product-discountType" value={productForm.discountType} onChange={handleFormChange} required>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="flat_rate">Flat Rate (₹)</option>
                                    </select>
                                </div>
                                {/* Discount Value Input */}
                                <div className="adp-form-group">
                                    <label htmlFor="adp-product-discount">Discount {productForm.discountType === 'percentage' ? '(%)' : '(₹)'}</label>
                                    <input type="number" id="adp-product-discount" min="0" value={productForm.discount === 0 ? '' : productForm.discount} onChange={handleFormChange} />
                                </div>
                            </div>
                            
                            {/* Auto-Calculated GST Display */}
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-gst-display">GST (%)</label>
                                <input type="text" id="adp-product-gst-display" disabled />
                            </div>

                            <div className="adp-form-group">
                                <label htmlFor="adp-product-discounted-total">Discounted Total (₹)</label>
                                <input type="text" id="adp-product-discounted-total" disabled />
                            </div>
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-final-price">Final Price (with GST)</label>
                                <input type="text" id="adp-product-final-price" disabled />
                            </div>
                            
                            {/* Shipping (Static Indian Zones) - Editable Inputs */}
                            <h4>Shipping Details (India Only)</h4>
                            <div className="adp-shipping-details-grid">
                                {Object.keys(initialFormState.shippingCharges).map(zone => (
                                    <div className="adp-shipping-zone-group" key={zone}>
                                        <label>{zone}</label>
                                        <input type="number" id={`adp-shipping-charges-${zone}`} className="adp-shipping-charges" placeholder="Charges (₹)" min="0" value={productForm.shippingCharges[zone] === 0 ? '' : productForm.shippingCharges[zone]} onChange={handleFormChange} />
                                        <input type="number" id={`adp-shipping-time-${zone}`} className="adp-shipping-time" placeholder="Time (days)" min="0" value={productForm.shippingTime[zone] === 0 ? '' : productForm.shippingTime[zone]} onChange={handleFormChange} />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Stock Management (Single input for initial stock, but data structure supports variants) */}
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-stock">Initial Stock Level (for default variant)</label>
                                <input type="number" id="adp-product-stock" min="0" value={productForm.stock === 0 ? '' : productForm.stock} onChange={handleFormChange} required />
                                <small style={{ color: 'var(--adp-secondary-text)' }}>This sets the initial stock for the first available color/size combination.</small>
                            </div>

                            {/* Image Upload Control (Incremental Upload) */}
                            <div className="adp-form-group">
                                <label>Product Photos ({MIN_FILES}-{MAX_FILES}, Max 400KB/image)</label>
                                
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    {/* Trigger Button */}
                                    <button type="button" onClick={handleManualImageAdd} className="adp-add-product-btn" style={{ background: 'var(--adp-success-color)' }} disabled={isLoading || (productForm.images || []).length >= MAX_FILES}>
                                        <ImageIcon /> Add Image(s)
                                    </button>
                                    
                                    {/* Hidden File Input (Ref attached) */}
                                    <input 
                                        type="file" 
                                        id="adp-product-images" 
                                        ref={fileInputRef} // Attached Ref
                                        accept="image/jpeg,image/png,image/webp" 
                                        onChange={handleFormChange} 
                                        multiple 
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                
                                {/* Display File List and Removal Buttons */}
                                <div style={{ marginTop: '10px', maxHeight: '150px', overflowY: 'auto', paddingRight: '10px' }}>
                                    { (productForm.images || []).map((file, index) => (
                                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px dotted var(--adp-border-color)' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--adp-text-color)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {index + 1}. {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                            </span>
                                            <button type="button" onClick={() => handleRemoveImage(index)} style={{ background: 'none', border: 'none', color: 'var(--adp-danger-color)', cursor: 'pointer', fontSize: '16px' }} disabled={isLoading}>
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>


                                <span className="adp-image-upload-status" style={{ color: imageUploadStatus.startsWith('Error') ? 'var(--adp-danger-color)' : 'var(--adp-text-color)', marginTop: '10px' }}>
                                    {imageUploadStatus}
                                </span>
                            </div>
                            
                            {/* Footer Buttons */}
                            <div className="adp-modal-footer">
                                <button type="button" className="adp-cancel-btn" onClick={() => setIsProductModalOpen(false)} disabled={isLoading}>Cancel</button>
                                <button type="submit" className="adp-save-btn" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* Modal for Managing Categories */}
            {isCategoryModalOpen && (
                <div className={`adp-modal adp-show`} id="adp-category-modal">
                    <div className="adp-modal-content">
                        <div className="adp-modal-header">
                            <h3 id="adp-category-modal-title">Manage Product Categories</h3>
                            <button className="adp-close-btn" onClick={() => setIsCategoryModalOpen(false)}>&times;</button>
                        </div>
                        <div className="adp-modal-body">
                            <form onSubmit={handleAddCategory}>
                                <div className="adp-form-group">
                                    <label htmlFor="adp-new-category-name">Add New Category</label>
                                    <input 
                                        type="text" 
                                        id="adp-new-category-name" 
                                        value={newCategoryName} 
                                        onChange={(e) => setNewCategoryName(e.target.value)} 
                                        required 
                                        placeholder="Enter new category name" 
                                        disabled={isLoading}
                                    />
                                    <div className="adp-modal-footer adp-category-add-footer">
                                        <button type="submit" className="adp-save-btn adp-category-add-btn" disabled={isLoading}>Add Category</button>
                                    </div>
                                </div>
                            </form>
                            
                            <h4 className="adp-existing-categories-title">Existing Categories</h4>
                            <ul className="adp-category-list" id="adp-existing-category-list">
                                {renderExistingCategoryList()}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className={`adp-modal adp-show`} id="adp-delete-confirm-modal">
                    <div className="adp-modal-content adp-confirm-modal-content">
                        <div className="adp-modal-header">
                            <h3>Confirm Deletion</h3>
                            <button className="adp-close-btn" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
                        </div>
                        <div className="adp-modal-body">
                            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                        </div>
                        <div className="adp-modal-footer">
                            <button type="button" className="adp-cancel-btn" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading}>Cancel</button>
                            <button type="button" className="adp-save-btn adp-delete-confirm-btn" onClick={handleConfirmDelete} disabled={isLoading}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;