import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import '../../styles/admin/ProductAddForm.css'; 
import { createProduct, updateProduct } from '../../api/productsApi';

// --- CONSTANTS ---
const initialCategories = ['Shirt', 'Pant', 'T-shirt', 'Kurta', 'Jacket', 'Denim', 'Jumpsuit', 'Sweater']; 
const MAX_UPLOAD_SIZE = 400 * 1024; // 400KB
const MIN_FILES = 2;
const MAX_FILES = 5;

// Initial state structure for a NEW product
const getInitialFormState = () => ({
    id: null,
    product_name: '',
    sku: '',
    description: '',
    short_description: '',
    brand: 'StyleScapes',
    category: '',
    style: 'Regular',
    material: '',
    
    // Pricing
    base_price: 0,
    discount_value: 0,
    discount_type: 'percentage',
    
    // Variations 
    available_colors: [], // [{ name: 'Red', hex_code: '#FF0000' }]
    available_sizes: [],  // ['S', 'M', 'L']
    
    // Runtime State
    newColorName: '',
    newColorHex: '',
    newSizeName: '',
    
    // Media
    images: [], 
});

// --- SVG Icons (Simplified) ---
const PlusIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const TrashIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);


// --- Main Component ---
const ProductAddForm = ({ isModalOpen, onClose, onSaveSuccess, productToEdit }) => {
    
    const [formData, setFormData] = useState(getInitialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null); 
    const token = localStorage.getItem('token');
    
    // --- FIX 1: Define isCreating using useMemo to make it accessible to JSX ---
    const isCreating = useMemo(() => !formData.id, [formData.id]);

    // --- Effect for Loading Edit Data ---
    useEffect(() => {
        if (productToEdit && isModalOpen) {
            setFormData(prev => ({
                ...getInitialFormState(), 
                ...productToEdit,
                id: productToEdit.id,
                product_name: productToEdit.product_name,
                short_description: productToEdit.short_description || '',
                base_price: productToEdit.price?.base_price || 0,
                discount_value: productToEdit.price?.discount_value || 0,
                discount_type: productToEdit.price?.discount_type || 'percentage',
                available_colors: productToEdit.available_colors || [],
                available_sizes: productToEdit.available_sizes || [],
                images: [], 
            }));
        } else if (isModalOpen) {
            setFormData(getInitialFormState());
        }
        setError(null);
    }, [productToEdit, isModalOpen]);

    // --- Calculations ---
    const discountedPrice = useMemo(() => {
        const value = formData.discount_value || 0;
        const base = formData.base_price || 0;

        if (formData.discount_type === 'flat_rate') {
            return Math.max(0, base - value);
        } else {
            return Math.max(0, base * (1 - value / 100));
        }
    }, [formData.base_price, formData.discount_value, formData.discount_type]);

    const calculatedGST_Rate = useMemo(() => {
        if (discountedPrice <= 1500) return 5;
        if (discountedPrice <= 10000) return 12;
        return 18;
    }, [discountedPrice]);

    const finalPrice = useMemo(() => discountedPrice + (discountedPrice * calculatedGST_Rate / 100), [discountedPrice, calculatedGST_Rate]);


    // --- Generic Handlers ---
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setError(null);
        
        let finalValue = value;
        if (id === 'base_price' || id === 'discount_value') {
            finalValue = finalValue === '' ? 0 : parseFloat(finalValue);
        }

        if (id === 'short_description') {
            if (value.length > 250) return;
        }

        setFormData(prev => ({ ...prev, [id]: finalValue }));
    };
    
    // --- VARIANT/SIZE/COLOR MANAGEMENT ---
    
    const handleAddColor = () => {
        if (!formData.newColorName || !formData.newColorHex) return setError("Color name and hex code are required.");
        
        const newColor = { 
            name: formData.newColorName.trim(), 
            hex_code: formData.newColorHex.trim() 
        };
        
        if (formData.available_colors.some(c => c.name === newColor.name)) return setError("Color already exists.");
        
        setFormData(prev => ({
            ...prev,
            available_colors: [...prev.available_colors, newColor],
            newColorName: '',
            newColorHex: '',
        }));
        setError(null);
    };

    const handleRemoveColor = (name) => {
        setFormData(prev => ({
            ...prev,
            available_colors: prev.available_colors.filter(c => c.name !== name)
        }));
    };
    
    const handleAddSize = () => {
        const newSize = formData.newSizeName.trim().toUpperCase();
        if (!newSize) return setError("Size name is required.");
        if (formData.available_sizes.includes(newSize)) return setError("Size already exists.");
        
        setFormData(prev => ({
            ...prev,
            available_sizes: [...prev.available_sizes, newSize],
            newSizeName: '',
        }));
        setError(null);
    };

    const handleRemoveSize = (name) => {
        setFormData(prev => ({
            ...prev,
            available_sizes: prev.available_sizes.filter(s => s !== name)
        }));
    };
    
    // --- IMAGE HANDLING ---
    const handleImageChange = (e) => {
        const newFiles = e.target.files;
        if (!newFiles || newFiles.length === 0) return;
        
        const validatedFiles = Array.from(newFiles).filter(file => file.size <= MAX_UPLOAD_SIZE);
        const currentFiles = formData.images || [];
        const combinedFiles = [...currentFiles, ...validatedFiles];

        if (combinedFiles.length > MAX_FILES) {
             setError(`Error: Total files cannot exceed ${MAX_FILES}.`);
             return;
        }
        
        setFormData(prev => ({ ...prev, images: combinedFiles })); 
        e.target.value = null; 
        setError(null);
    };
    
    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };


    // --- FORM SUBMISSION ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        // isCreating is now defined via useMemo

        const images = formData.images;
        
        // Validation on Create
        if (isCreating && images.length < MIN_FILES) {
             setIsLoading(false);
             return setError(`A minimum of ${MIN_FILES} images are required for a new product.`);
        }
        if (!formData.product_name || !formData.category || formData.base_price <= 0) {
            setIsLoading(false);
            return setError("Name, Category, and Price must be set.");
        }
        
        // 1. Construct Initial Stock Variants (only needed for CREATE)
        const initialStockVariants = [];
        if (isCreating) {
            formData.available_colors.forEach(color => {
                formData.available_sizes.forEach(size => {
                    initialStockVariants.push({
                        color: color.name,
                        size: size,
                        stock_level: 10
                    });
                });
            });
            if (initialStockVariants.length === 0) {
                 initialStockVariants.push({ color: 'Default', size: 'One Size', stock_level: 10 });
            }
        }
        
        // 2. Construct Payload
        const productPayload = {
            product_name: formData.product_name,
            sku: formData.sku,
            description: formData.description,
            short_description: formData.short_description,
            brand: formData.brand,
            category: formData.category,
            style: formData.style,
            material: formData.material,
            
            price: {
                base_price: formData.base_price,
                discount_value: formData.discount_value, 
                discount_type: formData.discount_type,
                sale_price: discountedPrice,
                is_on_sale: formData.discount_value > 0,
            },
            
            available_colors: formData.available_colors,
            available_sizes: formData.available_sizes,
            
            // Images payload structure (send placeholder names for now)
            images: {
                image_url: images.length > 0 ? images[0].name : (productToEdit?.images?.image_url || "placeholder_main_image_url"),
                additional_images: images.length > 1 ? images.slice(1).map(f => f.name) : (productToEdit?.images?.additional_images || [])
            },
        };

        // Add initial stock array only on creation
        if (isCreating) {
            productPayload.initial_stock_variants = initialStockVariants;
        }

        try {
            // 3. Perform API Call
            if (isCreating) {
                 await createProduct(productPayload, token);
            } else {
                 await updateProduct(formData.id, productPayload, token);
            }
            
            // 4. Handle Image Upload (Simulation/Placeholder)
            if (images.length > 0) {
                console.log(`Simulated ${images.length} image uploads for product ${formData.id || 'NEW'}`);
            }

            // FIX 2: Call onSaveSuccess (parent refresh) and onClose (modal close)
            onSaveSuccess(); 
            onClose(); 
            
        } catch (apiError) {
            // FIX 3: Capture and display backend error message clearly
            console.error("Product Submission Failed:", apiError);
            const errorMessage = apiError.response?.data?.message || apiError.message || 'Server error during submission. Check if Admin privileges are active.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    if (!isModalOpen) return null;

    return (
        <div className="apf-modal-overlay">
            <div className="apf-modal-content">
                <div className="apf-modal-header">
                    <h3 className="apf-modal-title">{isCreating ? 'Add New Product' : 'Edit Product Metadata'}</h3>
                    <button className="apf-close-btn" onClick={onClose} disabled={isLoading}>&times;</button>
                </div>
                
                <div className="apf-modal-body">
                    {error && <p className="apf-error-message">{error}</p>}
                    
                    <form onSubmit={handleSubmit}>
                        
                        {/* --- SECTION 1: CORE DETAILS & PRICING --- */}
                        <h4 className="apf-section-heading">1. Core Details & Pricing</h4>
                        <div className="apf-form-grid">
                            <div className="apf-form-group">
                                <label htmlFor="product_name">Product Name *</label>
                                <input type="text" id="product_name" value={formData.product_name} onChange={handleInputChange} required />
                            </div>
                            <div className="apf-form-group">
                                <label htmlFor="sku">Product SKU</label>
                                <input type="text" id="sku" value={formData.sku} onChange={handleInputChange} placeholder="Unique Product Code" />
                            </div>
                            <div className="apf-form-group">
                                <label htmlFor="brand">Brand</label>
                                <input type="text" id="brand" value={formData.brand} onChange={handleInputChange} required />
                            </div>
                            <div className="apf-form-group">
                                <label htmlFor="category">Category *</label>
                                <select id="category" value={formData.category} onChange={handleInputChange} required>
                                    <option value="">Select Category</option>
                                    {initialCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="apf-form-group apf-full-width">
                            <label htmlFor="short_description">Short Description (Max 250 chars)</label>
                            <textarea id="short_description" rows="2" value={formData.short_description} onChange={handleInputChange} />
                        </div>
                        <div className="apf-form-group apf-full-width">
                            <label htmlFor="description">Long Description</label>
                            <textarea id="description" rows="4" value={formData.description} onChange={handleInputChange} />
                        </div>
                        
                        {/* Pricing Grid */}
                        <div className="apf-form-grid apf-pricing-grid">
                            <div className="apf-form-group">
                                <label htmlFor="base_price">Base Price (₹) *</label>
                                <input type="number" id="base_price" min="0" value={formData.base_price === 0 ? '' : formData.base_price} onChange={handleInputChange} required />
                            </div>
                            <div className="apf-form-group">
                                <label htmlFor="discount_type">Discount Type</label>
                                <select id="discount_type" value={formData.discount_type} onChange={handleInputChange}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="flat_rate">Flat Rate (₹)</option>
                                </select>
                            </div>
                            <div className="apf-form-group">
                                <label htmlFor="discount_value">Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}</label>
                                <input type="number" id="discount_value" min="0" value={formData.discount_value === 0 ? '' : formData.discount_value} onChange={handleInputChange} />
                            </div>
                            
                            <div className="apf-form-group apf-readonly">
                                <label>Final Price (w/ GST {calculatedGST_Rate}%)</label>
                                <input type="text" readOnly value={`₹${finalPrice.toLocaleString('en-IN')}`} />
                            </div>
                        </div>

                        {/* --- SECTION 2: VARIANT MANAGEMENT --- */}
                        <h4 className="apf-section-heading">2. Product Variations</h4>
                        <div className="apf-variation-container">
                            
                            {/* Color Input */}
                            <div className="apf-variation-input-group">
                                <input type="text" value={formData.newColorName} onChange={(e) => setFormData(p => ({...p, newColorName: e.target.value}))} placeholder="New Color Name (e.g., Maroon)" />
                                <input type="color" value={formData.newColorHex} onChange={(e) => setFormData(p => ({...p, newColorHex: e.target.value}))} title="Select Hex Code" />
                                <button type="button" onClick={handleAddColor} className="apf-btn-add-var"><PlusIcon /> Color</button>
                            </div>
                            
                            {/* Size Input */}
                            <div className="apf-variation-input-group">
                                <input type="text" value={formData.newSizeName} onChange={(e) => setFormData(p => ({...p, newSizeName: e.target.value}))} placeholder="New Size (e.g., XL or 40)" />
                                <button type="button" onClick={handleAddSize} className="apf-btn-add-var"><PlusIcon /> Size</button>
                            </div>
                            
                            {/* Display Chips */}
                            <div className="apf-chip-display">
                                <p>Colors:</p>
                                {formData.available_colors.map((color, index) => (
                                    <span key={index} className="apf-chip apf-color-chip" style={{ borderColor: color.hex_code }}>
                                        {color.name}
                                        <button type="button" onClick={() => handleRemoveColor(color.name)}><TrashIcon /></button>
                                    </span>
                                ))}
                                
                                <p style={{ marginLeft: '20px' }}>Sizes:</p>
                                {formData.available_sizes.map((size, index) => (
                                    <span key={index} className="apf-chip apf-size-chip">
                                        {size}
                                        <button type="button" onClick={() => handleRemoveSize(size)}><TrashIcon /></button>
                                    </span>
                                ))}
                                
                                {/* Only show this note during creation if variants are defined */}
                                {isCreating && formData.available_sizes.length > 0 && formData.available_colors.length > 0 && (
                                    <p className="apf-note">This creates **{formData.available_colors.length * formData.available_sizes.length}** initial variants.</p>
                                )}
                            </div>
                        </div>

                        {/* --- SECTION 3: IMAGE UPLOAD --- */}
                        <h4 className="apf-section-heading">3. Media Upload (Min {MIN_FILES} Files)</h4>
                        <div className="apf-image-upload-area">
                            <input 
                                type="file" 
                                id="file-upload" 
                                ref={fileInputRef} 
                                accept="image/jpeg,image/png,image/webp" 
                                onChange={handleImageChange} 
                                multiple 
                                style={{ display: 'none' }}
                                disabled={isLoading || formData.images.length >= MAX_FILES}
                            />
                            
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current.click()} 
                                className="apf-btn-upload"
                                disabled={isLoading || formData.images.length >= MAX_FILES}
                            >
                                {formData.images.length === 0 ? 'Select Images' : `Add More (${formData.images.length}/${MAX_FILES})`}
                            </button>

                            <div className="apf-image-preview">
                                {formData.images.map((file, index) => (
                                    <div key={index} className="apf-preview-item">
                                        <span className="apf-preview-filename">{file.name}</span>
                                        <button type="button" onClick={() => handleRemoveImage(index)}><TrashIcon /></button>
                                    </div>
                                ))}
                                {isCreating && formData.images.length < MIN_FILES && (
                                    <p className="apf-note-error">Requires {MIN_FILES - formData.images.length} more files.</p>
                                )}
                            </div>
                        </div>
                        
                        {/* --- FOOTER BUTTONS --- */}
                        <div className="apf-modal-footer">
                            <button type="button" className="apf-btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
                            <button type="submit" className="apf-btn-submit" disabled={isLoading}>
                                {isLoading ? 'Processing...' : isCreating ? 'Create Product' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductAddForm;
