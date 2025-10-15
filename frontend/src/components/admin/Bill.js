import React, { useState, useEffect, useCallback } from 'react';
// Removed all external icon imports (lucide-react, @fortawesome)
import axios from 'axios'; 
import '../../styles/admin/Bill.css';

// Fixed/Editable Company Details
const COMPANY_DETAILS = {
  name: 'StyleScapes Retail Pvt Ltd',
  address: 'Shop 14, Ambience Mall, NH 8\nGurugram, Haryana, 122002',
  gstin: '06ABCDE1234F1Z5',
  phone: '+91 98765 43210',
  email: 'contact@stylescapes.com'
};

// DUMMY PRODUCT DATA (TEMPORARY REPLACEMENT FOR API FETCH/CRUD)
const DUMMY_PRODUCTS = [
  { id: 'prod1', name: 'Cotton T-Shirt', rate: 1200, gstRate: 12 },
  { id: 'prod2', name: 'Denim Jeans', rate: 2500, gstRate: 18 },
  { id: 'prod3', name: 'Wool Scarf', rate: 850, gstRate: 5 },
];

// Reusable SVG components (Standard icons for Bill.js)
const PrinterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
);
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const BoxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path><path d="M10 12h4"></path><path d="M12 10v4"></path></svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);


const Bill = ({ isAdmin = true }) => { 
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState(DUMMY_PRODUCTS); 
  const [invoiceCounter, setInvoiceCounter] = useState(1);
  const [customerDetails, setCustomerDetails] = useState({ name: '', address: '', phone: '' });
  const [currentProduct, setCurrentProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', isError: false });

  // --- Calculations ---
  const calculateTaxableValue = (item) => item.rate * item.quantity;
  const calculateGSTAmount = (item) => calculateTaxableValue(item) * (item.gstRate / 100);
  const calculateTotal = (item) => calculateTaxableValue(item) + calculateGSTAmount(item);

  const subTotalTaxable = items.reduce((sum, item) => sum + calculateTaxableValue(item), 0);
  const subTotalGST = items.reduce((sum, item) => sum + calculateGSTAmount(item), 0);
  const grandTotal = subTotalTaxable + subTotalGST;

  // Function to convert number to words (Simplified Placeholder)
  const numberToWords = (n) => {
    if (n === 0) return 'Zero';
    return `Rupees ${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} Only`;
  };

  // --- Handlers ---
  const handleAddItem = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === currentProduct);
    if (!product || quantity <= 0) {
      setNotification({ message: "Please select a valid product and quantity.", isError: true });
      return;
    }

    const newItem = {
      ...product,
      quantity: quantity,
      id: Date.now() 
    };

    setItems([...items, newItem]);
    setCurrentProduct('');
    setQuantity(1);
    setNotification({ message: "Item added successfully.", isError: false });
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setNotification({ message: "Item removed.", isError: false });
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleSaveInvoice = () => {
    setNotification({ message: `Invoice #${invoiceCounter} saved successfully!`, isError: false });
    setInvoiceCounter(prev => prev + 1);
    setItems([]);
    setCustomerDetails({ name: '', address: '', phone: '' });
  };

  const dummyProductAction = () => {
    setNotification({ message: "Product CRUD actions are currently disabled for demo.", isError: true });
  }

  // Effect to clear notifications
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ message: '', isError: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

  // --- Render Sections ---

  const renderProductSelector = () => (
    <div className="product-selector-box">
      <h3 className="controls-title">Add Product to Bill</h3>
      <form onSubmit={handleAddItem} className="add-item-form">
        <select 
          value={currentProduct} 
          onChange={(e) => setCurrentProduct(e.target.value)}
          required
        >
          <option value="">Select Product...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (₹{p.rate})
            </option>
          ))}
        </select>

        <input 
          type="number" 
          placeholder="Qty" 
          value={quantity} 
          min="1" 
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          required
        />
        <button type="submit" className="btn-add">
            <span className="icon-in-text">+</span> Add
        </button>
      </form>
      <button onClick={() => setShowProductModal(true)} className="btn-manage-products">
        <BoxIcon /> Manage Products
      </button>
    </div>
  );

  const renderInvoiceBox = (invoiceId) => (
    <div className="invoice-box" key={invoiceId}>
        <div className="invoice-header-details">
            <div className="company-details">
                <h1 className="company-name">{COMPANY_DETAILS.name}</h1>
                <p>{COMPANY_DETAILS.address.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>
                <p>GSTIN: {COMPANY_DETAILS.gstin}</p>
                <p>Phone: {COMPANY_DETAILS.phone}</p>
                <p>Email: {COMPANY_DETAILS.email}</p>
            </div>
            <div className="invoice-meta">
                <h2 className="invoice-title">TAX INVOICE</h2>
                <p><strong>Invoice No:</strong> INV-{invoiceId.toString().padStart(5, '0')}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
            </div>
        </div>

        <div className="customer-details">
            <p className="section-title">Bill To:</p>
            <p><strong>{customerDetails.name || 'CASH SALE'}</strong></p>
            <p>{customerDetails.address || 'N/A'}</p>
            <p>Phone: {customerDetails.phone || 'N/A'}</p>
        </div>

        <table className="items-table">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Description (HSN)</th>
                    <th>Rate</th>
                    <th>Qty</th>
                    <th>Taxable Value</th>
                    <th>GST %</th>
                    <th>Total</th>
                    <th className="no-print">Action</th>
                </tr>
            </thead>
            <tbody>
                {items.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-color)', padding: '15px' }}>No items added yet.</td></tr>
                ) : (
                    items.map((item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>₹{item.rate.toFixed(2)}</td>
                            <td>{item.quantity}</td>
                            <td>₹{calculateTaxableValue(item).toFixed(2)}</td>
                            <td>{item.gstRate}%</td>
                            <td>₹{calculateTotal(item).toFixed(2)}</td>
                            <td className="no-print">
                                <button onClick={() => handleDeleteItem(item.id)} className="btn-icon btn-danger" title="Remove Item">
                                    <TrashIcon />
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>

        <div className="summary-section">
            <div className="amount-words">
                <strong>Amount in Words:</strong> {numberToWords(grandTotal)}
            </div>
            <table className="summary-table">
                <tbody>
                    <tr>
                        <td><strong>Sub Total (Taxable)</strong></td>
                        <td>₹{subTotalTaxable.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Total GST</strong></td>
                        <td>₹{subTotalGST.toFixed(2)}</td>
                    </tr>
                    <tr className="grand-total-row">
                        <td><strong>GRAND TOTAL</strong></td>
                        <td>₹{grandTotal.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div className="invoice-footer">
            <p>E. & O.E. Goods once sold will not be taken back or exchanged. Subject to Gurugram jurisdiction.</p>
            <div className="signature-box">
                <div className="signature-line"></div>
                <p>For {COMPANY_DETAILS.name}</p>
            </div>
        </div>
    </div>
  );


  // --- Main Return ---
  return (
    <div className="invoice-app">
      {/* Notification Banner */}
      {notification.message && (
        <div className={`notification-banner ${notification.isError ? 'error' : 'success'}`}>
          <InfoIcon style={{ marginRight: '10px', height: '18px', width: '18px' }} />
          {notification.message}
        </div>
      )}

      <div className="invoice-container">
        {/* Controls Panel (Non-Printable) */}
        <div className="controls-panel no-print">
          <div className="action-buttons">
            <button onClick={handlePrint} className="btn btn-primary">
              <PrinterIcon /> Print Invoice
            </button>
            <button onClick={handleSaveInvoice} className="btn btn-secondary" disabled={items.length === 0}>
              <SaveIcon /> Save & Finalize
            </button>
          </div>
          {renderProductSelector()}
        </div>

        {/* Invoice Display */}
        {renderInvoiceBox(invoiceCounter)}
      </div>

      {/* Admin Product Management Modal (Only for Admin) */}
      {showProductModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Manage Products (Dummy Data)</h2>
              <button onClick={() => setShowProductModal(false)} className="modal-close">
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p className="text-muted" style={{marginBottom: '20px'}}>
                Product management features (add/delete/edit) are currently disabled.
                <br/>These will be fully integrated after backend routes are implemented.
              </p>
              
              <hr className="divider" />
              
              <h3 className="product-list-title">Loaded Product List</h3>
              <div className="product-list">
                <ul>
                  {products.map((p) => (
                    <li key={p.id}>
                      <span>{p.name} (₹{p.rate}, {p.gstRate}% GST)</span>
                      <button onClick={dummyProductAction} className="btn-icon btn-danger" title="Disabled">
                        <TrashIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bill;