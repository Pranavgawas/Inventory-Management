import React, { useState, useEffect } from 'react';
import { productsAPI, stockAPI } from '../../services/api';
import { AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react';
import './StockViewer.css';

const StockViewer = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [view, setView] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, lowStockRes, summaryRes] = await Promise.all([
        productsAPI.getAll(),
        stockAPI.getLowStock(10),
        stockAPI.getSummary()
      ]);

      setProducts(productsRes.data);
      setLowStockProducts(lowStockRes.data.products);
      setSummary(summaryRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setLoading(false);
    }
  };

  const getStockClass = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 10) return 'low-stock';
    return 'in-stock';
  };

  const displayProducts = view === 'low' ? lowStockProducts : products;

  if (loading) {
    return <div className="loading">Loading stock data...</div>;
  }

  return (
    <div className="stock-viewer">
      <h1>Stock Level Management</h1>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon">
            <Package size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Total Products</span>
            <span className="card-value">{summary?.totalProducts || 0}</span>
          </div>
        </div>

        <div className="summary-card in-stock-card">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">In Stock</span>
            <span className="card-value">{summary?.inStock || 0}</span>
          </div>
        </div>

        <div className="summary-card low-stock-card">
          <div className="card-icon">
            <TrendingDown size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Low Stock</span>
            <span className="card-value">{summary?.lowStock || 0}</span>
          </div>
        </div>

        <div className="summary-card out-stock-card">
          <div className="card-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Out of Stock</span>
            <span className="card-value">{summary?.outOfStock || 0}</span>
          </div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="alert-banner">
          <AlertTriangle size={20} />
          <span>{lowStockProducts.length} products are running low on stock!</span>
        </div>
      )}

      <div className="view-filters">
        <button 
          className={view === 'all' ? 'active' : ''} 
          onClick={() => setView('all')}
        >
          All Products
        </button>
        <button 
          className={view === 'low' ? 'active' : ''} 
          onClick={() => setView('low')}
        >
          Low Stock Only
        </button>
      </div>

      <div className="stock-table">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No products found</td>
              </tr>
            ) : (
              displayProducts.map(product => (
                <tr key={product._id} className={getStockClass(product.quantity)}>
                  <td className="product-name">{product.name}</td>
                  <td>{product.sku}</td>
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td className="price">₹{product.price.toLocaleString()}</td>
                  <td className="quantity">
                    <strong>{product.quantity}</strong> units
                  </td>
                  <td>
                    <span className={`status-badge ${getStockClass(product.quantity)}`}>
                      {product.quantity === 0 ? 'Out of Stock' : 
                       product.quantity <= 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockViewer;
