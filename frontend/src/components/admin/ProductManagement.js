import React, { useState, useEffect } from 'react';
import '../../styles/admin/ProductManagement.css'; 
import ProductAddForm from './ProductAddForm'; 
import { deleteProduct, getProducts } from '../../api/productsApi';

// --- CONSTANTS ---
const initialCategories = ['Shirt', 'Pant', 'T-shirt', 'Kurta', 'Jacket']; 
const LOW_STOCK_THRESHOLD = 5;

// --- SVG ICON LIBRARY ---
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const TagsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.828 2.217a1 1 0 0 1 1.414 0l9 9a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-1.414 0l-9-9a1 1 0 0 1 0-1.414l9-9z"/><circle cx="15" cy="9" r="2"/></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);


const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDeleteId, setProductToDeleteId] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null); 
    const [notification, setNotification] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedProducts, setExpandedProducts] = useState({});
    const token = localStorage.getItem('token');

    // --- Data Fetching (Initial Load and Global Sync) ---
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await getProducts(token);
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            setNotification('Error: Failed to load products. Check network.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProducts();
    }, [token]);

    // --- Handlers ---
    const handleAddProduct = () => {
        setProductToEdit(null); // Clear edit state for 'Add' flow
        setIsProductModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setProductToEdit(product); // Set the product data to pass to the form
        setIsProductModalOpen(true);
    };

    const handleFormSaveSuccess = () => {
        setNotification('Product successfully saved/created. Refreshing inventory...');
        setTimeout(() => setNotification(''), 3000);
        fetchProducts(); // Refresh the main view
    };

    const handleDeleteClick = (id) => {
        setProductToDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsLoading(true);
        try {
            await deleteProduct(productToDeleteId, token);
            setNotification(`Product ${productToDeleteId} deleted successfully.`);
            setProducts(products.filter(p => p.id !== productToDeleteId));
        } catch (error) {
            setNotification(`Error deleting product: ${error.message}`);
        } finally {
            setIsDeleteModalOpen(false);
            setProductToDeleteId(null);
            setIsLoading(false);
        }
    };

    const toggleProductExpansion = (productId) => {
        setExpandedProducts(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };
    
    // --- Helper Function to Render Variant Data ---
    const renderVariantDetails = (variantInventory) => {
        // Use Object.values to turn the SKU map into an array of variant objects
        const variants = Object.values(variantInventory);
        
        if (variants.length === 0) {
            return <p className="adp-variant-list-empty">No specific variants defined. This product may not have size/color options.</p>;
        }

        return (
            <div className="adp-variant-list-container">
                <table className="adp-variant-sub-table">
                    <thead>
                        <tr>
                            <th>Variant SKU</th>
                            <th>Color/Size</th>
                            <th>Stock Level</th>
                            <th>Alert</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((variant) => {
                            const stock = variant.stock_level;
                            const isLowStock = stock < LOW_STOCK_THRESHOLD && stock > 0;
                            const isOutOfStock = stock === 0;
                            
                            return (
                                <tr key={variant.variant_sku} className={`adp-variant-row ${isOutOfStock ? 'out-of-stock' : (isLowStock ? 'low-stock' : '')}`}>
                                    <td data-label="SKU">{variant.variant_sku}</td>
                                    <td data-label="Attributes">
                                        <span className="adp-variant-color-chip" style={{ backgroundColor: variant.color.split(' ')[0].toLowerCase() }}></span>
                                        {variant.color} / {variant.size}
                                    </td>
                                    <td data-label="Stock">
                                        <span className="adp-stock-value">{stock}</span>
                                    </td>
                                    <td data-label="Alert">
                                        {isOutOfStock ? '❌ OUT OF STOCK' : (isLowStock ? '🚨 LOW' : 'OK')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // --- Refactored Product Table Rows (Variant Focused) ---
    const renderProductTableRows = () => {
        if (isLoading) {
            return <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading product data...</td></tr>;
        }

        if (products.length === 0) {
            return <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--adp-secondary-text)' }}>No products found. Add a new product to begin.</td></tr>;
        }

        return products.map(product => {
            const stockLevel = product.total_stock_level || 0; 
            const isExpanded = expandedProducts[product.id];
            const hasLowStock = stockLevel < 10 && stockLevel > 0;
            const isOutOfStock = stockLevel === 0;

            let statusClass = '';
            if (isOutOfStock) statusClass = 'out-of-stock';
            else if (hasLowStock) statusClass = 'low-stock';
            else statusClass = 'in-stock';


            return (
                <React.Fragment key={product.id}>
                    {/* 1. PARENT ROW */}
                    <tr className={`adp-parent-row ${statusClass}`} onClick={() => toggleProductExpansion(product.id)}>
                        <td className="adp-expand-control" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => toggleProductExpansion(product.id)} className="adp-expand-btn">
                                {isExpanded ? '▼' : '►'}
                            </button>
                        </td>
                        <td><img src={product.images?.image_url} alt={product.product_name} className="adp-product-image" /></td>
                        <td>{product.product_name}</td>
                        <td>{product.category}</td>
                        <td>
                            <span className={`adp-total-stock adp-${statusClass}`}>
                                {isOutOfStock ? 'OUT OF STOCK' : `In Stock (${stockLevel})`}
                            </span>
                        </td>
                        <td className="adp-actions-cell">
                            <button className="adp-action-btn adp-edit-btn" onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}>
                                <EditIcon />
                            </button>
                            <button className="adp-action-btn adp-delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteClick(product.id); }}>
                                <TrashIcon />
                            </button>
                        </td>
                    </tr>

                    {/* 2. VARIANT DETAIL ROW */}
                    {isExpanded && (
                        <tr className="adp-variant-detail-row">
                            {/* Spans all columns */}
                            <td colSpan="6">
                                {renderVariantDetails(product.variant_inventory)}
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            );
        });
    };
    
    // NOTE: Category management removed as requested
    const handleManageCategories = () => {
        setNotification('Category management is handled directly via the Product Add/Edit Form select options.');
        setTimeout(() => setNotification(''), 4000);
    };

    return (
        <div className="adp-main-wrapper">
            <main className="adp-main-content" id="adp-main-content">
                <div className="adp-products-header">
                    <h2>Product Inventory & Stock Management</h2>
                    <div className="adp-header-actions">
                        <button className="adp-add-product-btn" onClick={handleAddProduct} disabled={isLoading}>
                            <PlusIcon /> Add New Product
                        </button>
                        <button className="adp-manage-category-btn" onClick={handleManageCategories} disabled={isLoading}>
                            <TagsIcon /> Manage Categories
                        </button>
                    </div>
                </div>

                {notification && <p className="adp-notification-bar">{notification}</p>}

                <div className="adp-product-table-container">
                    <table className="adp-product-table">
                        <thead>
                            <tr>
                                <th></th> {/* For expand button */}
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Total Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderProductTableRows()}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* PRODUCT ADD/EDIT MODAL - Using the separate component */}
            <ProductAddForm 
                isModalOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSaveSuccess={handleFormSaveSuccess}
                productToEdit={productToEdit}
            />
            
            {/* Delete Confirmation Modal (Remains in place) */}
            {isDeleteModalOpen && (
                <div className="adp-modal" id="adp-delete-confirm-modal">
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
