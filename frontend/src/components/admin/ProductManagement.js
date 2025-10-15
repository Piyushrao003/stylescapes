import React, { useState, useEffect } from 'react';
// Updated CSS Import Path
import '../../styles/admin/ProductManagement.css'; 
// Removed Font Awesome imports.

// --- SVG ICON LIBRARY ---
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


// --- Constants ---
const MAX_UPLOAD_SIZE = 400 * 1024; // 400KB

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

// Initial data states for a production application (ready for API data fetching)
const initialProducts = []; 
const initialCategories = ['Shirt', 'Pant', 'T-shirt', 'Kurta', 'Jacket']; 

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
    stock: 0,
    // Default values for Indian shipping zones
    shippingCharges: { 'Inside 1000km': 50, '1000-2000km': 100, '2k-3k': 150 },
    shippingTime: { 'Inside 1000km': 3, '1000-2000km': 5, '2k-3k': 7 },
    images: null,
};


const ProductManagement = () => {
    // --- State Hooks ---
    const [products, setProducts] = useState(initialProducts);
    const [categories, setCategories] = useState(initialCategories);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState(null);
    const [productForm, setProductForm] = useState(initialFormState);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [imageUploadStatus, setImageUploadStatus] = useState('');

    // --- Calculated Fields ---
    const discountedTotal = productForm.price - (productForm.price * (productForm.discount / 100));
    const calculatedGST_Rate = calculateGST(discountedTotal);
    const finalPrice = discountedTotal + (discountedTotal * (calculatedGST_Rate / 100));

    // --- Effects (Calculations) ---
    useEffect(() => {
        const discountedTotalCalc = productForm.price - (productForm.price * (productForm.discount / 100));
        const calculatedGST_Rate_Effect = calculateGST(discountedTotalCalc);
        const finalPriceCalc = discountedTotalCalc + (calculatedGST_Rate_Effect * (calculatedGST_Rate_Effect / 100));
        
        // Update price and GST display fields
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

    }, [productForm.price, productForm.discount]);

    // --- Image Validation (FIXED LOGIC) ---
    const processImageFiles = (files) => {
        const MIN_FILES = 3;
        const MAX_FILES = 5;
        const failedFiles = []; 

        // 1. File Count Validation
        if (files.length < MIN_FILES || files.length > MAX_FILES) {
            setImageUploadStatus(`Error: Please upload between ${MIN_FILES} and ${MAX_FILES} images (You uploaded ${files.length}).`);
            return null;
        }

        // 2. Size Validation: Check ALL files and collect failures
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > MAX_UPLOAD_SIZE) {
                // Collect all failed file details
                const fileSizeKB = (file.size / 1024).toFixed(1);
                failedFiles.push(`${file.name} (${fileSizeKB}KB)`);
            }
        }

        // 3. Final Error Reporting (Reports ALL failures at once)
        if (failedFiles.length > 0) {
            setImageUploadStatus(
                `Error: ${failedFiles.length} image(s) exceed the 400KB limit. 
                 Please reduce the size of the following files: ${failedFiles.join(', ')}.`
            );
            return null; // Stop form submission
        }
        
        // Success Case
        setImageUploadStatus("All images successfully validated (under 400KB).");
        return Array.from(files);
    };


    // --- Generic Handlers ---
    const handleFormChange = (e) => {
        const { id, value, type, files } = e.target;
        const stateId = id.replace('adp-product-', '');

        if (type === 'file') {
            setProductForm({ ...productForm, images: files });
        } else if (id.startsWith('adp-shipping-charges-') || id.startsWith('adp-shipping-time-')) {
            const zone = id.split('-').pop(); 
            const field = id.includes('charges') ? 'shippingCharges' : 'shippingTime';

            setProductForm(prev => ({
                ...prev,
                [field]: { ...prev[field], [zone]: parseFloat(value) || 0 }
            }));
        } else {
            // Update Price/Discount for immediate GST recalculation
            let updatedValue = type === 'number' ? parseFloat(value) : value;

            if (stateId === 'price' || stateId === 'discount') {
                setProductForm(prev => ({ ...prev, [stateId]: updatedValue || 0 }));
            } else {
                setProductForm(prev => ({ ...prev, [stateId]: updatedValue }));
            }
        }
    };

    // --- Product Management Logic ---
    const handleAddProduct = () => {
        setProductForm(initialFormState);
        setImageUploadStatus('');
        setIsProductModalOpen(true);
    };

    const handleEditProduct = (id) => {
        const product = products.find(p => p.id === id);
        if (product) {
            setProductForm({
                id: product.id,
                name: product.name,
                sku: `SKU${product.id}`,
                description: `(Description placeholder for product ${product.id})`,
                material: product.material || '',
                color: product.color || '',
                sizes: product.sizes ? product.sizes.join(', ') : '',
                category: product.category,
                price: product.price,
                discount: product.discount,
                stock: product.stock,
                shippingCharges: product.shipping ? Object.fromEntries(Object.entries(product.shipping).map(([k, v]) => [k, v.charges])) : initialFormState.shippingCharges,
                shippingTime: product.shipping ? Object.fromEntries(Object.entries(product.shipping).map(([k, v]) => [k, v.time])) : initialFormState.shippingTime,
                images: null,
            });
            setImageUploadStatus('Image fields are reset on edit. Please re-upload if needed.');
            setIsProductModalOpen(true);
        }
    };

    const handleDeleteClick = (id) => {
        setProductToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        // In production: Call delete API here
        setProducts(products.filter(p => p.id !== productToDeleteId));
        setIsDeleteModalOpen(false);
        setProductToDeleteId(null);
    };

    const handleProductFormSubmit = (e) => {
        e.preventDefault();
        setImageUploadStatus("Validating images...");

        const processedFiles = productForm.images ? processImageFiles(productForm.images) : null;

        if (!processedFiles) {
            return;
        }

        setImageUploadStatus("Images successfully validated. Saving product...");

        const newProduct = {
            id: productForm.id || Date.now(),
            name: productForm.name,
            category: productForm.category,
            price: productForm.price,
            discount: productForm.discount,
            gst: calculatedGST_Rate,
            stock: productForm.stock,
            material: productForm.material,
            color: productForm.color,
            sizes: productForm.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0),
            shipping: Object.keys(productForm.shippingCharges).reduce((acc, zone) => {
                acc[zone] = { charges: productForm.shippingCharges[zone], time: productForm.shippingTime[zone] };
                return acc;
            }, {}),
            image: `https://placehold.co/50x50/3d7ad6/ffffff?text=${processedFiles.length} Img`
        };

        // Simulate API saving and state update
        setProducts(prevProducts => {
            if (newProduct.id !== null && prevProducts.some(p => p.id === newProduct.id)) {
                return prevProducts.map(p => p.id === newProduct.id ? newProduct : p);
            } else {
                return [...prevProducts, newProduct];
            }
        });

        setImageUploadStatus("Product saved successfully!");

        setTimeout(() => {
            setIsProductModalOpen(false);
            setImageUploadStatus('');
        }, 1500);
    };

    // --- Category Management Logic ---
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
                        No products found. Use the "Add Product" button to begin.
                    </td>
                </tr>
            );
        }

        return products.map(product => {
            const stockClass = product.stock > 0 ? "adp-in-stock" : "adp-out-of-stock";
            const stockText = product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock";
            return (
                <tr key={product.id}>
                    <td><img src={product.image} alt={product.name} className="adp-product-image" /></td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price.toLocaleString("en-IN")}</td>
                    <td><span className={`adp-stock-status ${stockClass}`}>{stockText}</span></td>
                    <td className="adp-actions-cell">
                        <button className="adp-action-btn adp-edit-btn" onClick={() => handleEditProduct(product.id)}>
                            <EditIcon />
                        </button>
                        <button className="adp-action-btn adp-delete-btn" onClick={() => handleDeleteClick(product.id)}>
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
                <button className="adp-remove-btn" onClick={() => handleRemoveCategory(category)}>
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
                        <button className="adp-add-product-btn" onClick={handleAddProduct}>
                            <PlusIcon /> Add Product
                        </button>
                        <button className="adp-manage-category-btn" onClick={() => setIsCategoryModalOpen(true)}>
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
                            
                            {/* New Fields */}
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
                                <input type="number" id="adp-product-price" min="0" value={productForm.price || ''} onChange={handleFormChange} required />
                            </div>
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-discount">Discount (%)</label>
                                <input type="number" id="adp-product-discount" min="0" max="100" value={productForm.discount || ''} onChange={handleFormChange} />
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
                            
                            {/* Shipping (Static Indian Zones) */}
                            <h4>Shipping Details (India Only)</h4>
                            <div className="adp-shipping-details-grid">
                                {Object.keys(initialFormState.shippingCharges).map(zone => (
                                    <div className="adp-shipping-zone-group" key={zone}>
                                        <label>{zone}</label>
                                        <input type="number" id={`adp-shipping-charges-${zone}`} className="adp-shipping-charges" placeholder="Charges (₹)" min="0" value={productForm.shippingCharges[zone] || ''} onChange={handleFormChange} />
                                        <input type="number" id={`adp-shipping-time-${zone}`} className="adp-shipping-time" placeholder="Time (days)" min="1" value={productForm.shippingTime[zone] || ''} onChange={handleFormChange} />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Stock and Images */}
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-stock">Stock</label>
                                <input type="number" id="adp-product-stock" min="0" value={productForm.stock || ''} onChange={handleFormChange} required />
                            </div>
                            <div className="adp-form-group">
                                <label htmlFor="adp-product-images">Product Photos (3-5, Max 400KB/image)</label>
                                <input type="file" id="adp-product-images" accept="image/jpeg,image/png,image/webp" onChange={handleFormChange} multiple required={!productForm.id} />
                                <span className="adp-image-upload-status" style={{ color: imageUploadStatus.startsWith('Error') ? 'var(--adp-danger-color)' : 'var(--adp-text-color)' }}>
                                    {imageUploadStatus}
                                </span>
                            </div>
                            
                            {/* Footer Buttons */}
                            <div className="adp-modal-footer">
                                <button type="button" className="adp-cancel-btn" onClick={() => setIsProductModalOpen(false)}>Cancel</button>
                                <button type="submit" className="adp-save-btn">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* Modal for Managing Categories */}
            <div className={`adp-modal ${isCategoryModalOpen ? 'adp-show' : ''}`} id="adp-category-modal">
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
                                />
                                <div className="adp-modal-footer adp-category-add-footer">
                                    <button type="submit" className="adp-save-btn adp-category-add-btn">Add Category</button>
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

            {/* Delete Confirmation Modal */}
            <div className={`adp-modal ${isDeleteModalOpen ? 'adp-show' : ''}`} id="adp-delete-confirm-modal">
                <div className="adp-modal-content adp-confirm-modal-content">
                    <div className="adp-modal-header">
                        <h3>Confirm Deletion</h3>
                        <button className="adp-close-btn" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
                    </div>
                    <div className="adp-modal-body">
                        <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                    </div>
                    <div className="adp-modal-footer">
                        <button type="button" className="adp-cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                        <button type="button" className="adp-save-btn adp-delete-confirm-btn" onClick={handleConfirmDelete}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;