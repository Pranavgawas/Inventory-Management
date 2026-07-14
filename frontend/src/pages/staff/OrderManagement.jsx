import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './OrderManagement.css';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={20} />;
      case 'confirmed': return <Truck size={20} />;
      case 'completed': return <CheckCircle size={20} />;
      case 'cancelled': return <XCircle size={20} />;
      default: return <Package size={20} />;
    }
  };

  const handleProcessOrder = async (orderId, newStatus) => {
    try {
      await ordersAPI.process(orderId, { 
        status: newStatus, 
        notes: notes 
      });
      
      toast.success(`Order ${newStatus} successfully!`);
      setSelectedOrder(null);
      setNotes('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to process order');
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  const getFilterCount = (filterType) => {
    if (filterType === 'all') return stats.total;
    return stats[filterType] || 0;
  };

  if (loading) {
    return (
      <div className="loading">
        <Package size={48} />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="header">
        <h1>Order Management</h1>
        <div className="stats">
          <div className="stat-card">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{stats.pending}</span>
          </div>
          <div className="stat-card completed">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.completed}</span>
          </div>
        </div>
      </div>

      <div className="filters">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button 
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            <span className="filter-label">{f.charAt(0).toUpperCase() + f.slice(1)}</span>
            <span className="filter-count">{getFilterCount(f)}</span>
          </button>
        ))}
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <Package size={64} />
            <p>No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{String(index + 1).padStart(4, '0')}</h3>
                  <div className="order-meta">
                    <p><strong>Customer:</strong> {order.customer?.username || 'N/A'}</p>
                    <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}</p>
                  </div>
                </div>
                <span className={`status-badge ${order.status}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-item">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-value price">₹{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Method</span>
                  <span className="payment-badge">{order.paymentMethod}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Items</span>
                  <span className="detail-value">{order.items.length} item(s)</span>
                </div>
              </div>

              <div className="order-actions">
                <button onClick={() => setSelectedOrder(order)} className="view-btn">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Order Details</h2>
            
            <div className="modal-items">
              {selectedOrder.items.map(item => (
                <div key={item._id} className="modal-item">
                  <span>{item.product?.name || 'Product'} (x{item.quantity})</span>
                  <span>₹{item.subtotal.toLocaleString()}</span>
                </div>
              ))}
              <div className="modal-total">
                <strong>Total Amount:</strong>
                <span>₹{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
              <div className="modal-payment">
                <strong>Payment Method:</strong>
                <span className="payment-badge">{selectedOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="process-section">
              <textarea
                placeholder="Add notes (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              
              <div className="action-buttons">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleProcessOrder(selectedOrder._id, 'confirmed')}
                      className="bg-blue-500"
                    >
                      Confirm Order
                    </button>
                    <button 
                      onClick={() => handleProcessOrder(selectedOrder._id, 'cancelled')}
                      className="bg-red-500"
                    >
                      Cancel Order
                    </button>
                  </>
                )}
                
                {selectedOrder.status === 'confirmed' && (
                  <button 
                    onClick={() => handleProcessOrder(selectedOrder._id, 'completed')}
                    className="bg-green-500"
                  >
                    Mark as Completed
                  </button>
                )}

                <button onClick={() => setSelectedOrder(null)} className="close-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
