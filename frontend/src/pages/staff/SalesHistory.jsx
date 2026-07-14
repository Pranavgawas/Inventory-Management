import React, { useState, useEffect } from 'react';
import { salesAPI } from '../../services/api';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import './SalesHistory.css';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSales();
  }, [period]);

  const fetchSales = async () => {
    try {
      const response = await salesAPI.getAll({ period });
      setSales(response.data.sales);
      setSummary({
        count: response.data.count,
        totalSales: response.data.totalSales,
        totalQuantity: response.data.totalQuantity
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setLoading(false);
    }
  };

  const exportSales = async () => {
    try {
      const response = await salesAPI.export({ period });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${period}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage('Report downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to export report');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading sales history...</div>;
  }

  return (
    <div className="sales-history">
      <div className="header">
        <h1>Sales History</h1>
        <button onClick={exportSales} className="export-btn">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Total Sales</span>
            <span className="card-value">₹{summary?.totalSales.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <Calendar size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Transactions</span>
            <span className="card-value">{summary?.count || 0}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Items Sold</span>
            <span className="card-value">{summary?.totalQuantity || 0}</span>
          </div>
        </div>
      </div>

      <div className="period-filters">
        <button 
          className={period === 'daily' ? 'active' : ''} 
          onClick={() => setPeriod('daily')}
        >
          Daily
        </button>
        <button 
          className={period === 'weekly' ? 'active' : ''} 
          onClick={() => setPeriod('weekly')}
        >
          Weekly
        </button>
        <button 
          className={period === 'monthly' ? 'active' : ''} 
          onClick={() => setPeriod('monthly')}
        >
          Monthly
        </button>
      </div>

      <div className="date-filter">
        <div className="filter-group">
          <label>
            <Calendar size={16} />
            From:
          </label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
        </div>
        <div className="filter-group">
          <label>
            <Calendar size={16} />
            To:
          </label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
        </div>
        {(startDate || endDate) && (
          <button 
            onClick={() => { setStartDate(''); setEndDate(''); }} 
            className="clear-filter-btn"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="sales-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Processed By</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No sales records found</td>
              </tr>
            ) : (
              sales
                .filter(sale => {
                  const saleDate = new Date(sale.saleDate);
                  const start = startDate ? new Date(startDate) : null;
                  const end = endDate ? new Date(endDate) : null;
                  
                  if (start && saleDate < start) return false;
                  if (end) {
                    const endOfDay = new Date(end);
                    endOfDay.setHours(23, 59, 59, 999);
                    if (saleDate > endOfDay) return false;
                  }
                  return true;
                })
                .map(sale => (
                <tr key={sale._id}>
                  <td>{new Date(sale.saleDate).toLocaleDateString('en-IN')}</td>
                  <td>{sale.product?.name || 'N/A'}</td>
                  <td>{sale.customer?.username || 'N/A'}</td>
                  <td>{sale.quantity}</td>
                  <td className="amount">₹{sale.totalAmount.toLocaleString()}</td>
                  <td>
                    <span className="payment-badge">{sale.paymentMethod}</span>
                  </td>
                  <td>{sale.processedBy?.username || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesHistory;
