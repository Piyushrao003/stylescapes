// frontend/src/components/admin/Dashboard.js

import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import '../../styles/admin/Dashboard.css'; 

Chart.register(...registerables);

// --- SVG ICON LIBRARY (No external library dependency) ---
const ChartLineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m18 6-5 5-4-4-5 5"/></svg>
);
const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 12.87a2 2 0 0 0 2 1.63h9.72a2 2 0 0 0 2-1.63L23 6H6"/></svg>
);
const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const PackageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="m21 15-9-5.15-9 5.15"/><path d="m3 9 9 5.15 9-5.15"/><path d="M12 22.78V14"/></svg>
);
const LayoutDashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
);
const RefreshCwIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.78 2.76L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.78-2.76L3 16"/><path d="M3 21v-5h5"/></svg>
);


// --- Constants for Data Handling ---
const METRIC_TYPES = {
  SALES: 'sales',
  REVENUE: 'revenue',
};

const PIE_TYPES = {
  CATEGORY: 'category',
  PAYMENT: 'payment',
};

// Placeholder for empty data to keep component structure stable
const EMPTY_DATA = { labels: [], data: [], title: 'No Data Available', label: 'Value (in ₹)', colors: [] };
const INITIAL_KPI_STATE = [
  { id: 1, title: "Total Sales", value: "--", description: "No data loaded.", icon: ChartLineIcon, color: 'var(--success-color)' },
  { id: 2, title: "New Orders", value: "--", description: "No data loaded.", icon: ShoppingCartIcon, color: 'var(--accent-color)' },
  { id: 3, title: "New Users", value: "--", description: "No data loaded.", icon: UsersIcon, color: 'var(--info-color)' },
  { id: 4, title: "Pending Shipments", value: "--", description: "No data loaded.", icon: PackageIcon, color: 'var(--warning-color)' },
];
const INITIAL_PRODUCT_LISTS = { top: [], worst: [] };


const Dashboard = () => {
  const [theme] = useState('dark-theme');
  const [kpis, setKpis] = useState(INITIAL_KPI_STATE);
  const [salesGraphData, setSalesGraphData] = useState(EMPTY_DATA);
  const [pieChartData, setPieChartData] = useState(EMPTY_DATA);
  const [productLists, setProductLists] = useState(INITIAL_PRODUCT_LISTS);
  const [fetchError, setFetchError] = useState(null);
  
  const salesChartRef = useRef(null);
  const pieChartRef = useRef(null);
  let salesChartInstance = useRef(null);
  let pieChartInstance = useRef(null);


  // --- Helper: Generate Gradient for Charts (Needed for Theme) ---
  const getGradient = (chart, color) => {
    if (!chart.ctx) return 'rgba(0, 0, 0, 0.1)';
    const gradient = chart.ctx.createLinearGradient(0, 0, 0, 400);
    // Note: In a real app, this should fetch colors from computed CSS if possible
    const colorRGB = getComputedStyle(document.documentElement).getPropertyValue(color).trim() || '#4a90e2';
    gradient.addColorStop(0, `${colorRGB}FF`); // Full opacity
    gradient.addColorStop(1, `${colorRGB}00`); // Transparent
    return gradient;
  };
  
  // --- Helper: Prepare Mock Data (No longer mocking, just structuring empty data) ---
  // This helper is no longer needed since data is now fetched from the API (conceptually).

  // --- 2. CHART RENDERING ---
  const renderChart = (chartRef, type, chartData) => {
    if (!chartRef.current) return;

    // Destroy existing instances if they exist
    if (type === 'line' && salesChartInstance.current) {
        salesChartInstance.current.destroy();
    } else if (type === 'pie' && pieChartInstance.current) {
        pieChartInstance.current.destroy();
    }

    // Only attempt to render if there is data to display
    if (chartData.data.length === 0) return;

    const isLine = type === 'line';
    const chartType = isLine ? 'line' : 'doughnut';

    const newChartInstance = new Chart(chartRef.current, {
        type: chartType,
        data: {
            labels: chartData.labels,
            datasets: [{
                label: chartData.label,
                data: chartData.data,
                backgroundColor: isLine ? (context) => getGradient(context.chart, '--accent-color') : chartData.colors,
                borderColor: isLine ? 'var(--accent-color)' : chartData.colors,
                borderWidth: 2,
                fill: isLine,
                tension: 0.4,
                pointRadius: isLine ? 5 : 0,
                pointHoverRadius: isLine ? 7 : 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: isLine ? 'top' : 'right',
                    labels: { color: 'var(--text-color)' }
                },
                title: {
                    display: true,
                    text: chartData.title,
                    color: 'var(--text-color)',
                    font: { size: 16, weight: '600' }
                }
            },
            scales: isLine ? {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'var(--secondary-text)' },
                    grid: { color: 'var(--border-color)' }
                },
                x: {
                    ticks: { color: 'var(--secondary-text)' },
                    grid: { color: 'var(--border-color)' }
                }
            } : {}
        }
    });

    if (type === 'line') {
        salesChartInstance.current = newChartInstance;
    } else {
        pieChartInstance.current = newChartInstance;
    }
  };


  // --- 1. API CALL & Data Processing ---
  const fetchMetrics = async () => {
    setFetchError(null);
    // setIsLoading(true); // Uncomment if you add an isLoading state

    try {
        // --- 1. KPI Data (Placeholder for API Call) ---
        // const kpisResponse = await axios.get('/api/admin/kpis'); 
        // Logic to map kpisResponse.data to the 'kpis' state
        
        // --- Placeholder Logic for initial empty state ---
        setKpis(prevKpis => prevKpis.map(kpi => ({ ...kpi, value: '--', description: 'Data not available (API needed)' })));

        // --- 2. Graph Data (Set to Empty) ---
        setSalesGraphData(EMPTY_DATA);
        setPieChartData(EMPTY_DATA);
        
        // --- 3. Product Lists (Set to Empty) ---
        // const productsResponse = await axios.get('/api/admin/product-performance');
        setProductLists(INITIAL_PRODUCT_LISTS);

    } catch (error) {
        console.error("Dashboard fetch error:", error);
        setFetchError(`Failed to load dashboard metrics. Please check API status or user authentication.`);
    } /* finally {
        // setIsLoading(false);
    } */
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (salesGraphData.data.length > 0) {
        renderChart(salesChartRef, 'line', salesGraphData);
    }
  }, [salesGraphData]);

  useEffect(() => {
    if (pieChartData.data.length > 0) {
        renderChart(pieChartRef, 'pie', pieChartData);
    }
  }, [pieChartData]);
  // --- END EFFECTS ---


  // --- 3. RENDER ---
  return (
    <div className="add-dashboard-container">
      <main className="add-main-content">
        
        {/* KPI Cards */}
        <div className="add-kpi-grid">
          {kpis.map(kpi => {
            const IconComponent = kpi.icon;
            return (
              <div key={kpi.id} className="add-card add-kpi-card">
                <div className="add-header">
                  <span className="add-title">{kpi.title}</span>
                  <div className="add-icon-box" style={{ backgroundColor: kpi.color }}>
                    <IconComponent />
                  </div>
                </div>
                <div className="add-value">{kpi.value}</div>
                <div className="add-description">{kpi.description}</div>
              </div>
            );
          })}
        </div>

        {/* Charts & Graphs */}
        <div className="add-charts-grid">
          
          {/* Sales/Revenue Graph */}
          <div className="add-card add-graph-card">
            <div className="add-graph-header">
                <h3>{salesGraphData.title}</h3>
                <div className="add-graph-controls">
                    {/* These buttons would typically toggle between METRIC_TYPES.SALES and METRIC_TYPES.REVENUE */}
                    <button className="add-control-btn active">Sales</button>
                    <button className="add-control-btn">Revenue</button>
                    <button className="add-control-btn" onClick={fetchMetrics}>
                        <RefreshCwIcon />
                    </button>
                </div>
            </div>
            <div className="add-chart-container">
                {salesGraphData.data.length === 0 ? (
                    <div className="add-empty-chart-message">No sales data loaded. Click reload.</div>
                ) : (
                    <canvas ref={salesChartRef} className="add-sales-chart"></canvas>
                )}
            </div>
          </div>
          
          {/* Pie Chart */}
          <div className="add-card add-pie-card">
            <h3>{pieChartData.title}</h3>
            <div className="add-pie-chart-container">
                {pieChartData.data.length === 0 ? (
                    <div className="add-empty-chart-message">No category data loaded.</div>
                ) : (
                    <canvas ref={pieChartRef} className="add-pie-chart"></canvas>
                )}
            </div>
          </div>
        </div>

        {/* Product Performance Lists */}
        <div className="add-product-lists-grid">
          <div className="add-product-list-card add-top-selling">
            <h3>Top 5 Selling Products</h3>
            <ul className="add-product-list">
                {productLists.top.length > 0 ? (
                    productLists.top.map((p, i) => (
                        <li key={i}>
                            <span className="add-product-name">{p.name}</span>
                            <span className="add-product-value">{p.value}</span>
                        </li>
                    ))
                ) : (
                    <li><span className="add-product-name">No top selling data available.</span></li>
                )}
            </ul>
          </div>

          <div className="add-product-list-card add-worst-selling">
            <h3>Top 5 Worst Selling Products</h3>
            <ul className="add-product-list">
                {productLists.worst.length > 0 ? (
                    productLists.worst.map((p, i) => (
                        <li key={i}>
                            <span className="add-product-name">{p.name}</span>
                            <span className="add-product-value">{p.value}</span>
                        </li>
                    ))
                ) : (
                    <li><span className="add-product-name">No worst selling data available.</span></li>
                )}
            </ul>
          </div>
        </div>

        {/* Global Error/Empty State Placeholder */}
        {fetchError && (
          <div className="add-placeholder-content" style={{ backgroundColor: 'var(--danger-color)', color: 'white', borderColor: 'transparent' }}>
            <LayoutDashboardIcon />
            <h3>Data Load Error</h3>
            <p>{fetchError}</p>
            <button 
                onClick={fetchMetrics} 
                style={{ marginTop: '15px', padding: '8px 15px', background: 'white', color: 'var(--danger-color)', borderRadius: '6px', border: 'none' }}
            >
                Try Reloading
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;